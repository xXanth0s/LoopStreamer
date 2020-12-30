import { injectable } from 'inversify';
import { IStoreService } from '../../shared/services/store.service.interface';
import { StateModel } from '../../store/models/state.model';
import backgroundStore from '../../store/store/background-store';

@injectable()
export class BackgroundStoreService implements IStoreService<StateModel> {
    dispatch(data: any): void {
        backgroundStore.dispatch(data);
    }

    getState(): StateModel {
        return backgroundStore.getState()
    }

    subscribe(listener: () => void): () => void {
        return backgroundStore.subscribe(listener);
    }
}
