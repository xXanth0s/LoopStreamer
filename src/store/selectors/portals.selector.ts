import { StateModel } from '../models/state.model';
import Portal from '../models/portal.model';
import { Logger } from '../../shared/services/logger';

export const getAllPortals = (state: StateModel): Portal[] => Object.values(state.portals);

export const getPortalForKey = (state: StateModel, portalKey: Portal['key']): Portal => {
    const portal = state.portals[portalKey];
    if (!portal) {
        Logger.error(`[PortalsSelector->getPortalForKey] No portal found for key ${portalKey}`);
    }

    return portal;
};
