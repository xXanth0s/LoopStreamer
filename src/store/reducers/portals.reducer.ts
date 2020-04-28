import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import Portal from '../models/portal.model';
import {mapArrayToObject} from '../utils/selector.utils';
import {PORTALS} from '../enums/portals.enum';

const updatePortals = (portals: Portal[]): { [key: string]: Portal } => {
    return mapArrayToObject(portals, 'key');
};

const initialPortalsData: { [key: string]: Portal } = {
    'bs': {
        key: 'bs',
        index: 0,
        regex: '^https:\/\/bs.to\/serie',
        controllerName: PORTALS.BS,
        url: 'https://bs.to/',
        name: 'burning series',
        iframeRegex: 'https://bs.to/out/*'
    }
};

const portalsSlice = createSlice({
    name: 'portals',
    initialState: initialPortalsData,
    reducers: {
        updatePortalsAction: (state: { [key: string]: Portal }, action: PayloadAction<Portal[]>) => updatePortals(action.payload)
    }
});


export const {updatePortalsAction} = portalsSlice.actions;

export default portalsSlice;



