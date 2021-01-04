import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { StateModel } from '../models/state.model';
import { LinkModel } from '../models/link.model';
import { mapArrayToObject } from '../utils/selector.utils';
import { deleteSeriesAction } from '../actions/shared.actions';
import { Series } from '../models/series.model';

const initialState: StateModel['links'] = {};

function updateOrAddMultipleLinks(state: StateModel['links'], links: LinkModel[]): StateModel['links'] {
    return {
        ...state,
        ...mapArrayToObject(links, 'key'),
    };
}

function updateOrAddLink(state: StateModel['links'], linkModel: LinkModel): StateModel['links'] {
    return {
        ...state,
        [linkModel.key]: linkModel,
    };
}

function deleteLinksForSeries(state: StateModel['links'], seriesKey: string): StateModel['links'] {
    return Object.values(state).reduce((obj, link) => {
        if (!link.key.startsWith(seriesKey)) {
            obj[link.key] = link;
        }

        return obj;
    }, {});
}

/* eslint-disable max-len */
const linkSlice = createSlice({
    name: 'links',
    initialState,
    reducers: {
        updateOrAddMultipleLinksAction: (state: StateModel['links'], action: PayloadAction<LinkModel[]>) => updateOrAddMultipleLinks(state, action.payload),
        updateOrAddLinkAction: (state: StateModel['links'], action: PayloadAction<LinkModel>) => updateOrAddLink(state, action.payload),
    },
    extraReducers: (builder) => {
        builder.addCase(deleteSeriesAction, (state: StateModel['links'], action: PayloadAction<Series['key']>) => deleteLinksForSeries(state, action.payload));
    },
});
/* eslint-enable max-len */

export const {
    updateOrAddLinkAction,
    updateOrAddMultipleLinksAction,
} = linkSlice.actions;

export default linkSlice;
