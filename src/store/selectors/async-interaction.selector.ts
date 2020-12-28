import { StateModel } from '../models/state.model';
import { AsyncInteraction, AsyncInteractionCreator } from '../models/async-interaction.model';
import SeriesEpisode from '../models/series-episode.model';
import {
    loadingSeasonAsyncInteraction,
    loadingSeriesSearchResult,
    startEpisodeAsyncInteraction
} from '../actions/async-interactions';

export const getAsyncInteractions = <T>(state: StateModel, creator: AsyncInteractionCreator<T>): AsyncInteraction<T>[] => {
    return Object.values(state.controlState.asyncInteractions)
        .filter<AsyncInteraction<T>>(creator.isInstanceOf);
};

export const isPreparingEpisode = (state: StateModel, episodeKey: SeriesEpisode['key']): boolean => {
    const asyncInteractions = getAsyncInteractions(state, startEpisodeAsyncInteraction);
    return asyncInteractions.some(action => action.payload.episodeKey === episodeKey);
};

export const isPreparingVideo = (state: StateModel): boolean => Boolean(getAsyncInteractions(state, startEpisodeAsyncInteraction).length);

export const isLoadingSeason = (state: StateModel): boolean => Boolean(getAsyncInteractions(state, loadingSeasonAsyncInteraction).length);

export const isLoadingSearchResult = (state: StateModel): boolean => Boolean(getAsyncInteractions(state, loadingSeriesSearchResult).length);
