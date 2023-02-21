import { StateModel } from '../models/state.model';
import { AsyncInteraction, AsyncInteractionCreator } from '../models/async-interaction.model';
import { SeriesEpisode } from '../models/series-episode.model';
import {
    loadingSeasonAsyncInteraction, loadingSeasonForcedAsyncInteraction,
    loadingSeriesSearchResult,
    startEpisodeAsyncInteraction,
} from '../actions/async-interactions';

export function getFirstAsyncInteraction(state: StateModel): AsyncInteraction<any> {
    return getAllAsyncInteractions(state)[0];
}

export function getAllAsyncInteractions(state: StateModel): AsyncInteraction<any>[] {
    return Object.values(state.controlState.asyncInteractions);
}

export function getAsyncInteractions<T>(
    state: StateModel,
    creators: AsyncInteractionCreator<T> | AsyncInteractionCreator<T>[]): AsyncInteraction<T>[] {
    return (Array.isArray(creators) ? creators : [creators]).flatMap(creator =>
        Object.values(state.controlState.asyncInteractions)
            .filter<AsyncInteraction<T>>(creator.isInstanceOf),
    );
}

export function isPreparingEpisode(state: StateModel, episodeKey: SeriesEpisode['key']): boolean {
    const asyncInteractions = getAsyncInteractions(state, startEpisodeAsyncInteraction);
    return asyncInteractions.some(action => action.payload.episodeKey === episodeKey);
}

export function isPreparingVideo(state: StateModel): boolean {
    return Boolean(getAsyncInteractions(state, startEpisodeAsyncInteraction).length);
}

export function isLoadingSeason(state: StateModel): boolean {
    const actions = [
        loadingSeasonAsyncInteraction,
        loadingSeasonForcedAsyncInteraction,
    ];
    return Boolean(getAsyncInteractions(state, actions).length);
}

// @ts-ignore
export function isLoadingSearchResult(state: StateModel): boolean {
    return Boolean(getAsyncInteractions(state, loadingSeriesSearchResult).length);
}
