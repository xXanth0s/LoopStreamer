import { injectable } from 'inversify';
import { IStoreService } from './store.service.interface';
import { StateModel } from '../../store/models/state.model';
import browserStore from '../../store/store/browser-store';

@injectable()
export class BrowserStoreService implements IStoreService<StateModel> {
    dispatch(data: any): Promise<void> {
        return browserStore.dispatch(data);
    }

    getState(): StateModel {
        return browserStore.getState();
    }

    subscribe(listener: () => void): () => void {
        return browserStore.subscribe(listener);
    }
}
