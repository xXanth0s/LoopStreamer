import { inject, injectable } from 'inversify';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { distinctUntilChanged, finalize } from 'rxjs/operators';
import { ActionCreatorWithOptionalPayload, AsyncThunkAction } from '@reduxjs/toolkit';
import { SHARED_TYPES } from '../constants/SHARED_TYPES';
import { IStoreService } from './store.service.interface';
import { StateModel } from '../../store/models/state.model';
import { setActiveEpisodeAction } from '../../store/reducers/control-state.reducer';
import { thunkConfig } from '../../store/types/thunk-config.type';

type SelectorArguments<T, P> = P extends (state: T, ...args: infer A) => any ? A : never;

type Selector = (state: StateModel, ...args: any[]) => any;

/* eslint-disable max-len */
@injectable()
export class StoreService {
    constructor(@inject(SHARED_TYPES.Store) private readonly store: IStoreService<StateModel>) {
    }

    private playerHasStopped$ = new Subject();

    public selectSync<P extends Selector>(selector: P, ...args: SelectorArguments<StateModel, P>): ReturnType<P> {
        return selector(this.store.getState(), ...args);
    }

    public select<P extends Selector>(selector: P, ...args: SelectorArguments<StateModel, P>): Observable<ReturnType<P>> {
        const subject = new Subject<StateModel>();
        return this.selectHelper(subject, selector, ...args);
    }

    public selectBehaviour<P extends Selector>(selector: P, ...args: SelectorArguments<StateModel, P>): Observable<ReturnType<P>> {
        const subject = new BehaviorSubject<P>(selector(this.store.getState(), ...args));
        return this.selectHelper(subject, selector, ...args);
    }

    public dispatch(action: ReturnType<ActionCreatorWithOptionalPayload<any>> | AsyncThunkAction<any, any, thunkConfig>): void | Promise<void> {
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
            }),
        );
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

/* eslint-enable max-len */
