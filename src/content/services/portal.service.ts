import { inject, injectable } from 'inversify';
import { SHARED_TYPES } from '../../shared/constants/SHARED_TYPES';
import { StoreService } from '../../shared/services/store.service';
import Portal from '../../store/models/portal.model';
import { getActivePortal } from '../../store/selectors/portals.selector';
import { IPortalController } from '../controller/portals/portal.controller.interface';
import { inversifyContentContainer } from '../container/container';
import { getContentTypeForPortal } from '../container/content-container.utils';

@injectable()
export class PortalService {

    constructor(@inject(SHARED_TYPES.StoreService) private readonly store: StoreService) {
    }

    private _portal: Portal;
    private _portalController: IPortalController;

    private get portal(): Portal {
        if (!this._portal) {
            this._portal = this.store.selectSync(getActivePortal);
        }
        return this._portal;
    }

    public getPortalController(): IPortalController {
        if (!this._portalController && this.portal) {
            const symbol = getContentTypeForPortal(this.portal.controllerName);
            this._portalController = inversifyContentContainer.get<IPortalController>(symbol);
        }
        if (!this._portalController) {
            console.error('PortalService.getPortalController: No controller found');
        }

        return this._portalController;
    }
}
