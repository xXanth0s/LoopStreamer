import { inversifyContainer } from '../../background/container/container';
import { StoreService } from '../../shared/services/store.service';
import { SHARED_TYPES } from '../../shared/constants/SHARED_TYPES';

export function stopPlayer() {
    inversifyContainer.get<StoreService>(SHARED_TYPES.StoreService).stopPlayer();
}
