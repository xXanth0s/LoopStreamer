import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import Portal from '../models/portal.model';
import { mapArrayToObject } from '../utils/selector.utils';
import { PORTALS } from '../enums/portals.enum';
import { StateModel } from '../models/state.model';
import { updateOrAddMultipleLinksAction } from './link.reducer';
import { LinkModel } from '../models/link.model';
import { LINK_TYPE } from '../enums/link-type.enum';

const updatePortals = (portals: Portal[]): { [key in PORTALS]: Portal } => {
    // @ts-ignore
    return mapArrayToObject(portals, 'key');
};

const initialPortalsData: { [key in PORTALS]?: Portal } = {
    [PORTALS.BS]: {
        key: PORTALS.BS,
        index: 0,
        urlRegex: '^https://burningseries.co',
        controllerName: PORTALS.BS,
        baseUrl: 'https://burningseries.co/',
        seriesListUrl: 'https://burningseries.co/andere-serien',
        name: 'Burning Series',
        series: [],
    }
};

function addMultipleLinks(state: Partial<Record<PORTALS, Portal>>, links: LinkModel[]) {
    const filteredLinks = links.filter(link => link.type === LINK_TYPE.PORTAL_SERIES_LINK);
    if (filteredLinks.length === 0) {
        return;
    }

    state[filteredLinks[0].portal].series = filteredLinks.map(link => link.parentKey);
}

const portalsSlice = createSlice({
    name: 'portals',
    initialState: initialPortalsData,
    reducers: {
        updatePortalsAction: (state: { [key in PORTALS]: Portal }, action: PayloadAction<Portal[]>) => updatePortals(action.payload)
    }, extraReducers: (builder) => {
        builder.addCase(updateOrAddMultipleLinksAction, (state: StateModel['portals'], action: PayloadAction<LinkModel[]>) =>
            addMultipleLinks(state, action.payload));
    },
});


export const {updatePortalsAction} = portalsSlice.actions;

export default portalsSlice;



