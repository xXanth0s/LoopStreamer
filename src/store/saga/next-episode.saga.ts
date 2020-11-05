import { select } from 'redux-saga/effects';
import { getFirstEpisodeForSeason, getNextEpisode, getSeriesEpisodeByKey } from '../selectors/series-episode.selector';
import { StateModel } from '../models/state.model';
import SeriesEpisode from '../models/series-episode.model';
import { PORTALS } from '../enums/portals.enum';
import { SeriesSeason } from '../models/series-season.model';
import { loadSeasonInformationForPortal } from './load-season.saga';
import { getNextSeason, getSeriesSeasonByKey } from '../selectors/series-season.selector';
import { loadSeriesInformationForPortal } from './load-series.saga';

export function* getNextEpisodeSaga(episodeKey: SeriesEpisode['key'], portalKey: PORTALS) {
    const state: StateModel = yield select();
    const lastEpisode = getSeriesEpisodeByKey(state, episodeKey);
    if (!lastEpisode) {
        return null;
    }

    const nextEpisode = yield getNextEpisodeForSameSeason(lastEpisode, portalKey);
    if (nextEpisode) {
        return nextEpisode;
    }

    return yield getFirstEpisodeForNextSeason(lastEpisode.seasonKey, portalKey);
}

function* getNextEpisodeForSameSeason({ key, seasonKey }: SeriesEpisode, portalKey: PORTALS) {
    let state = yield select();
    const nextEpisode = getNextEpisode(state, key);
    if (nextEpisode) {
        return nextEpisode;
    }

    yield loadSeasonInformationForPortal(seasonKey, portalKey);

    return getNextEpisode(yield select(), key);
}

function* getFirstEpisodeForNextSeason(seasonKey: SeriesSeason['key'], portalKey: PORTALS) {
    let nextSeason: SeriesSeason = yield getOrLoadNextSeason(seasonKey, portalKey);
    if (!nextSeason) {
        return null;
    }

    const state = yield select();
    const firstEpisode = getFirstEpisodeForSeason(state, nextSeason.key);
    if (firstEpisode) {
        return firstEpisode;
    }

    yield loadSeasonInformationForPortal(seasonKey, portalKey);

    return getFirstEpisodeForSeason(yield select(), nextSeason.key);
}

function* getOrLoadNextSeason(seasonKey: SeriesSeason['key'], portalKey: PORTALS) {
    const state: StateModel = yield select();
    let nextSeason = getNextSeason(state, seasonKey);
    if (nextSeason) {
        return nextSeason;
    }

    const currentSeason = getSeriesSeasonByKey(state, seasonKey);

    const isSeriesUpdateSuccessful = yield loadSeriesInformationForPortal(currentSeason.seriesKey, portalKey);
    if (!isSeriesUpdateSuccessful) {
        return null;
    }

    return getNextSeason(yield select(), seasonKey);
}
