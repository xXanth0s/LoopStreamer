import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import Providor from '../models/providor.model';
import { mapArrayToObject } from '../utils/selector.utils';
import { PROVIDORS } from '../enums/providors.enum';

const initialState: Partial<Record<PROVIDORS, Providor>> = {
    Vivo: {
        key: PROVIDORS.Vivo,
        names: [ 'Vivo' ],
        index: 0,
        urlRegex: '^https://vivo',
        baseUrl: 'https://vivo.sx/*',
        controllerName: PROVIDORS.Vivo,
        isUsed: true,
        icon: '/assets/images/providors/vivo.png',
    },
    Openload: {
        key: PROVIDORS.Openload,
        names: [ 'OpenLoad' ],
        index: 1,
        urlRegex: '^https://openload',
        baseUrl: 'https://openload.co/*',
        controllerName: PROVIDORS.Openload,
        isUsed: true,
        icon: '/resources/img/providors/openload.png',
    },
    MIXdrop: {
        key: PROVIDORS.MIXdrop,
        names: [ 'MIXdrop', 'mixdrop' ],
        index: 2,
        urlRegex: '^https://mixdrop.co/',
        baseUrl: 'https://mixdrop.co/*',
        controllerName: PROVIDORS.MIXdrop,
        isUsed: true,
        icon: '/resources/img/providors/openload.png',
    },
};

const updateProvidors = (providors: Providor[]): { [key: string]: Providor } => mapArrayToObject(providors, 'key');

export const providorsSlice = createSlice({
    name: 'providors',
    initialState,
    reducers: {
        updateProvidorsAction: (state: { [key: string]: Providor }, action: PayloadAction<Providor[]>) => updateProvidors(action.payload),
    },
});

export const { updateProvidorsAction } = providorsSlice.actions;
