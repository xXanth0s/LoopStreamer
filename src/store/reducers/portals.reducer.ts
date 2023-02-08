import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Portal } from '../models/portal.model';
import { mapArrayToObject } from '../utils/selector.utils';
import { PORTALS } from '../enums/portals.enum';
import { StateModel } from '../models/state.model';
import { updateOrAddMultipleLinksAction } from './link.reducer';
import { LinkModel } from '../models/link.model';
import { LINK_TYPE } from '../enums/link-type.enum';

const updatePortals = (portals: Portal[]): { [key in PORTALS]: Portal } =>
// @ts-ignore
    mapArrayToObject(portals, 'key');
const initialPortalsData: { [key in PORTALS]?: Portal } = {
    [PORTALS.STO]: {
        key: PORTALS.STO,
        index: 0,
        urlRegex: '^http://190.115.18.20/',
        controllerName: PORTALS.STO,
        baseUrl: 'http://190.115.18.20/',
        seriesListUrl: 'http://190.115.18.20/serien',
        name: 'Serien Stream',
        series: [],
    },
};

function addMultipleLinks(state: Partial<Record<PORTALS, Portal>>, links: LinkModel[]) {
    const filteredLinks = links.filter(link => link.type === LINK_TYPE.PORTAL_SERIES_LINK);
    if (filteredLinks.length === 0) {
        return;
    }

    state[filteredLinks[0].portal].series = filteredLinks.map(link => link.parentKey);
}

/* eslint-disable max-len */
const portalsSlice = createSlice({
    name: 'portals',
    initialState: initialPortalsData,
    reducers: {
        updatePortalsAction: (state: { [key in PORTALS]: Portal }, action: PayloadAction<Portal[]>) => updatePortals(action.payload),
    },
    extraReducers: (builder) => {
        builder.addCase(updateOrAddMultipleLinksAction, (state: StateModel['portals'], action: PayloadAction<LinkModel[]>) => addMultipleLinks(state, action.payload));
    },
});
/* eslint-enable max-len */

export const { updatePortalsAction } = portalsSlice.actions;

export default portalsSlice;
