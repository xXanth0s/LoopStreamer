import {inject, injectable} from 'inversify';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {distinctUntilChanged, finalize} from 'rxjs/operators';
import {SHARED_TYPES} from '../constants/SHARED_TYPES';
import {IStoreService} from './store.service.interface';
import {StateModel} from '../../store/models/state.model';

@injectable()
export class StoreService {

    constructor(@inject(SHARED_TYPES.Store) private readonly store: IStoreService<StateModel>) {
    }

    private playerHasStopped$ = new Subject();

    public selectSync<T>(selector: (state: any, ...args: any[]) => T, ...args: any[]): T {
        return selector(this.store.getState(), ...args);
    }

    public select<T>(selector: (state: any, ...args: any[]) => T, ...args: any[]): Observable<T> {
        const subject = new Subject<T>();
        return this.selectHelper(subject, selector, ...args);
    }

    public selectCopy<T>(selector: (state: any, ...args: any[]) => T, ...args: any[]): Observable<T> {
        const subject = new Subject<T>();
        return this.selectHelper(subject, selector, ...args);
    }

    public selectBehaviour<T>(selector: (state: any, ...args: any[]) => T, ...args: any[]): Observable<T> {
        const subject = new BehaviorSubject<T>(selector(this.store.getState()));
        return this.selectHelper(subject, selector, ...args);
    }

    public dispatch(action: any): void | Promise<void> {
        return this.store.dispatch(action);
    }

    private selectHelper<T>(subject: Subject<T>, selector: (state: any, ...args: any[]) => T, ...args: any[]): Observable<T> {
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
        this.playerHasStopped$.next()
    }
}
