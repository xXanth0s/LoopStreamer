import { inject, injectable } from 'inversify';
import { SHARED_TYPES } from '../../shared/constants/SHARED_TYPES';
import { StoreService } from '../../shared/services/store.service';
import { IPortalController } from '../controller/portals/portal.controller.interface';
import { inversifyContentContainer } from '../container/container';
import { getContentTypeForPortal } from '../container/content-container.utils';
import { PORTALS } from '../../store/enums/portals.enum';

@injectable()
export class PortalService {

    constructor(@inject(SHARED_TYPES.StoreService) private readonly store: StoreService) {
    }

    private _portalController: IPortalController;

    public getPortalController(portalKey: PORTALS): IPortalController {
        if (!this._portalController) {
            const symbol = getContentTypeForPortal(portalKey);
            this._portalController = inversifyContentContainer.get<IPortalController>(symbol);
        }
        if (!this._portalController) {
            console.error('PortalService.getPortalController: No controller found');
        }

        return this._portalController;
    }
}
