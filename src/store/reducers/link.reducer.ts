import { StateModel } from '../models/state.model';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { LinkModel } from '../models/link.model';
import { mapArrayToObject } from '../utils/selector.utils';

const initialState: StateModel['links'] = {};

function updateOrAddMultipleLinks(state: StateModel['links'], links: LinkModel[]): StateModel['links'] {
    return {
        ...state,
        ...mapArrayToObject(links, 'key')
    }
}

function updateOrAddLink(state: StateModel['links'], linkModel: LinkModel): StateModel['links'] {
    return {
        ...state,
        [linkModel.key]: linkModel,
    };
}

const linkSlice = createSlice({
    name: 'links',
    initialState,
    reducers: {
        updateOrAddMultipleLinksAction: (state: StateModel['links'], action: PayloadAction<LinkModel[]>) =>
            updateOrAddMultipleLinks(state, action.payload),
        updateOrAddLinkAction: (state: StateModel['links'], action: PayloadAction<LinkModel>) =>
            updateOrAddLink(state, action.payload)
    }
})

export const {
    updateOrAddLinkAction,
    updateOrAddMultipleLinksAction,
} = linkSlice.actions

export default linkSlice;
