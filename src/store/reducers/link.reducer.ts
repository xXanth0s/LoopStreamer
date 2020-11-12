import { StateModel } from '../models/state.model';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { LinkModel } from '../models/link.model';
import { mapArrayToObject } from '../utils/selector.utils';

const initialState: StateModel['links'] = {};

function addOrUpdateMultipleLinks(state: StateModel['links'], links: LinkModel[]): StateModel['links'] {
    return {
        ...state,
        ...mapArrayToObject(links, 'key')
    }
}

function addOrUpdateLink(state: StateModel['links'], linkModel: LinkModel): StateModel['links'] {
    return {
        ...state,
        [linkModel.key]: linkModel,
    };
}

const linkSlice = createSlice({
    name: 'links',
    initialState,
    reducers: {
        addOrUpdateMultipleLinksAction: (state: StateModel['links'], action: PayloadAction<LinkModel[]>) =>
            addOrUpdateMultipleLinks(state, action.payload),
        addOrUpdateLinkAction: (state: StateModel['links'], action: PayloadAction<LinkModel>) =>
            addOrUpdateLink(state, action.payload)
    }
})

export const {
    addOrUpdateLinkAction,
    addOrUpdateMultipleLinksAction,
} = linkSlice.actions

export default linkSlice;
