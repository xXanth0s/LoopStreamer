import { inject, injectable } from 'inversify';
import { SHARED_TYPES } from '../../shared/constants/SHARED_TYPES';
import { StoreService } from '../../shared/services/store.service';
import { getActivePortal } from '../../store/selectors/portals.selector';

@injectable()
export class PortalService {

    constructor(@inject(SHARED_TYPES.StoreService) private readonly store: StoreService) {
    }

    public isUrlValid(url?: string): boolean {
        if(url) {
            const portal = this.store.selectSync(getActivePortal)

            const regex = new RegExp(portal.urlRegex, 'i');
            return regex.test(url);
        }

        return false
    }
}
