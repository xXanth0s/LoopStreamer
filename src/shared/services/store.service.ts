import { inject, injectable } from 'inversify';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { distinctUntilChanged, finalize } from 'rxjs/operators';
import { SHARED_TYPES } from '../constants/SHARED_TYPES';
import { IStoreService } from './store.service.interface';
import { ActionCreatorWithOptionalPayload } from '@reduxjs/toolkit';
import { StateModel } from '../../store/models/state.model';
import { setActiveEpisodeAction } from '../../store/reducers/control-state.reducer';

type SelectorArguments<T, P> = P extends (state: T, ...args: infer A) => any ? A : never;

@injectable()
export class StoreService {

    constructor(@inject(SHARED_TYPES.Store) private readonly store: IStoreService<StateModel>) {
    }

    private playerHasStopped$ = new Subject();

    public selectSync<P extends (state: StateModel, ...args: any[]) => any>(selector: P, ...args: SelectorArguments<StateModel, P>): ReturnType<P> {
        return selector(this.store.getState(), ...args);
    }

    public select<P extends (state: StateModel, ...args: any[]) => any>(selector: P, ...args: SelectorArguments<StateModel, P>): Observable<ReturnType<P>> {
        const subject = new Subject<StateModel>();
        return this.selectHelper(subject, selector, ...args);
    }

    public selectCopy<P extends (state: StateModel, ...args: any[]) => any>(selector: P, ...args: SelectorArguments<StateModel, P>): Observable<ReturnType<P>> {
        const subject = new Subject<P>();
        return this.selectHelper(subject, selector, ...args);
    }

    public selectBehaviour<P extends (state: StateModel, ...args: any[]) => any>(selector: P, ...args: SelectorArguments<StateModel, P>): Observable<ReturnType<P>> {
        const subject = new BehaviorSubject<P>(selector(this.store.getState(), ...args));
        return this.selectHelper(subject, selector, ...args);
    }

    public dispatch(action: ReturnType<ActionCreatorWithOptionalPayload<any>>): void | Promise<void> {
        return this.store.dispatch(action);
    }

    private selectHelper<P>(subject: Subject<P>, selector: (state: any, ...args: any[]) => P, ...args: any[]): Observable<P> {
        const unsubscribe = this.store.subscribe(() => {
            const result = selector(this.store.getState(), ...args);
            subject.next(result);
        });

        return subject.pipe(
            distinctUntilChanged(),
            finalize(() => {
                unsubscribe();
            })
        )
    }

    public playerHasStopped(): Observable<unknown> {
        return this.playerHasStopped$.asObservable();
    }

    public stopPlayer(): void {
        console.log('player stopped');
        this.playerHasStopped$.next();
    }

    public resetControlState(): void {
        this.dispatch(setActiveEpisodeAction(null));
    }
}
