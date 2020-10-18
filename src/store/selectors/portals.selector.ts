import { StateModel } from '../models/state.model';
import Portal from '../models/portal.model';

export const getAllPortals = (state: StateModel): Portal[] => Object.values(state.portals);


export const getPortalForKey = (state: StateModel, portalKey: Portal['key']): Portal => {
    const portal = state.portals[portalKey];
    if(!portal) {
        console.error('getPortalForKey: No portal found');
    }

    return portal;
};

export const getActivePortal = (state: StateModel): Portal | null => {
    if(state.controlState.activePortal) {
        return getPortalForKey(state, state.controlState.activePortal);
    }

    console.error('getCurrentPortal: No currentPortal found');
    return null;
};
