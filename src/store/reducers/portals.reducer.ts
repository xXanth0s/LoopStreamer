import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import Portal from '../models/portal.model';
import {mapArrayToObject} from '../utils/selector.utils';
import {PORTALS} from '../enums/portals.enum';

const updatePortals = (portals: Portal[]): { [key in PORTALS]: Portal } => {
    // @ts-ignore
    return mapArrayToObject(portals, 'key');
};

const initialPortalsData: { [key in PORTALS]?: Portal } = {
    [PORTALS.BS]: {
        key: PORTALS.BS,
        index: 0,
        regex: '^https:\/\/bs.to\/serie',
        controllerName: PORTALS.BS,
        baseUrl: 'https://bs.to',
        seriesListUrl: 'https://bs.to/andere-serien',
        name: 'Burning Series',
    }
};

const portalsSlice = createSlice({
    name: 'portals',
    initialState: initialPortalsData,
    reducers: {
        updatePortalsAction: (state: { [key in PORTALS]: Portal }, action: PayloadAction<Portal[]>) => updatePortals(action.payload)
    }
});


export const {updatePortalsAction} = portalsSlice.actions;

export default portalsSlice;



