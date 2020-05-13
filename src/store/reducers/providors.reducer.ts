import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import Providor from '../models/providor.model';
import { mapArrayToObject } from '../utils/selector.utils';
import { PROVIDORS } from '../enums/providors.enum';

const initialState: {[key: string]: Providor} = {
    Vivo : {
        key: 'Vivo',
        names: ['Vivo'],
        index: 1,
        urlRegex: '^https://vivo',
        baseUrl: 'https://vivo.sx/*',
        controllerName: PROVIDORS.Vivo,
        isUsed: true,
        icon: '/assets/images/providors/vivo.png',
    },
    // 'OpenLoad': {
    //     key: "OpenLoad",
    //     names: ['OpenLoad'],
    //     index: 0,
    //     urlRegex: "^https://openload",
    //     url: "https://openload.co/*",
    //     controllerName: PROVIDORS.Openload,
    //     kinoxId: 67,
    //     isUsed: true,
    //     icon: "/resources/img/providors/openload.png",
    //     checkElement: "#videooverlay"
    // },
};

const updateProvidors = (providors: Providor[]): {[key: string]: Providor} => {
    return mapArrayToObject(providors, 'key');
};

export const providorsReducer = createSlice({
    name: 'providors',
    initialState,
    reducers: {
        updateProvidorsAction: (state: {[key: string]: Providor}, action: PayloadAction<Providor[]>) => updateProvidors(action.payload)
    }
});


export const {updateProvidorsAction} = providorsReducer.actions;
