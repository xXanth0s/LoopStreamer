import { StateModel } from '../models/state.model';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { LinkModel } from '../models/link.model';

const initialState: StateModel['links'] = {};

function addOrUpdateMultipleLinks(state: StateModel['links'], links: LinkModel[]): StateModel['links'] {
    return links.reduce((newState, link) => {
        return addOrUpdateLink(newState, link);
    }, state)
}

function addOrUpdateLink(state: StateModel['links'], linkModel: LinkModel): StateModel['links'] {
    const oldLink = state[linkModel.key];
    if(oldLink) {
        return {
            ...state,
            [linkModel.key]: {
                ...oldLink,
                ...linkModel,
                dateAdded: oldLink.dateAdded,
            }
        }
    }

    return {
        ...state,
        [linkModel.key]: linkModel,
    }
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
