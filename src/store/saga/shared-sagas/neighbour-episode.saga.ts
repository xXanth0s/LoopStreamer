import SeriesEpisode from '../../models/series-episode.model';
import { PORTALS } from '../../enums/portals.enum';
import { select } from 'redux-saga/effects';
import {
    getEpisodeWithOffset,
    getFirstEpisodeForSeason,
    getLastEpisodeForSeason,
    getSeriesEpisodeByKey
} from '../../selectors/series-episode.selector';
import { loadSeasonInformationForPortal } from '../load-season.saga';
import { SeriesSeason } from '../../models/series-season.model';
import { StateModel } from '../../models/state.model';
import { getSeasonWithOffset, getSeriesSeasonByKey } from '../../selectors/series-season.selector';
import { loadSeriesInformationForPortal } from '../load-series.saga';

export function* getNeighbourEpisode(startEpisodeKey: SeriesEpisode['key'], portalKey: PORTALS, higherNeighbour: boolean) {
    const lastEpisode = getSeriesEpisodeByKey(yield select(), startEpisodeKey);
    if (!lastEpisode) {
        return null;
    }

    const nextEpisode = yield getNeighbourEpisodeForSameSeason(lastEpisode, portalKey, higherNeighbour);
    if (nextEpisode) {
        return nextEpisode;
    }

    return yield getNextEpisodeForNeighbourSeason(lastEpisode.seasonKey, portalKey, higherNeighbour);
}

function* getNeighbourEpisodeForSameSeason({ key, seasonKey }: SeriesEpisode, portalKey: PORTALS, higherNeighbour: boolean) {
    const offest = higherNeighbour ? 1 : -1;
    const neighbourEpisode = getEpisodeWithOffset(yield select(), key, offest);
    if (neighbourEpisode) {
        return neighbourEpisode;
    }

    yield loadSeasonInformationForPortal(seasonKey, portalKey);

    return getEpisodeWithOffset(yield select(), key, offest);
}

function* getNextEpisodeForNeighbourSeason(seasonKey: SeriesSeason['key'], portalKey: PORTALS, higherNeighbour: boolean) {
    let neighbourSeason: SeriesSeason = yield getAndUpdateNeighbourSeason(seasonKey, portalKey, higherNeighbour);
    if (!neighbourSeason) {
        return null;
    }

    const state = yield select();
    if (higherNeighbour) {
        return getFirstEpisodeForSeason(state, neighbourSeason.key);
    }

    return getLastEpisodeForSeason(state, neighbourSeason.key);
}

function* getAndUpdateNeighbourSeason(seasonKey: SeriesSeason['key'], portalKey: PORTALS, higherNeighbour: boolean) {
    const state: StateModel = yield select();
    const offset = higherNeighbour ? 1 : -1;

    let neighbourSeason = getSeasonWithOffset(state, seasonKey, offset);
    if (neighbourSeason) {
        yield loadSeasonInformationForPortal(neighbourSeason.key, portalKey);
        return getSeasonWithOffset(yield select(), seasonKey, offset);
    }

    const currentSeason = getSeriesSeasonByKey(state, seasonKey);

    yield loadSeriesInformationForPortal(currentSeason.seriesKey, portalKey);

    const hasNewNeighbourSeason = Boolean(getSeasonWithOffset(yield select(), seasonKey, offset));
    if (hasNewNeighbourSeason) {
        yield loadSeasonInformationForPortal(neighbourSeason.key, portalKey);
        return getSeasonWithOffset(yield select(), seasonKey, offset);
    }

    return null;
}