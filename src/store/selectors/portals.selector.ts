import { StateModel } from '../models/state.model';
import Portal from '../models/portal.model';
import { Logger } from '../../shared/services/logger';

export const getAllPortals = (state: StateModel): Portal[] => Object.values(state.portals);


export const getPortalForKey = (state: StateModel, portalKey: Portal['key']): Portal => {
    const portal = state.portals[portalKey];
    if(!portal) {
        Logger.error(`[PortalsSelector->getPortalForKey] No portal found for key ${portalKey}`);
    }

    return portal;
};

export const getActivePortal = (state: StateModel): Portal | null => {
    if (!state.controlState.activePortal) {
        Logger.error(`[PortalsSelector->getActivePortal]  No active Portal found`);
        return null;
    }

    return getPortalForKey(state, state.controlState.activePortal);
};
