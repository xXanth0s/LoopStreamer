import SeriesEpisode from '../../models/series-episode.model';
import { PORTALS } from '../../enums/portals.enum';
import { select } from 'redux-saga/effects';
import {
    getEpisodeWithOffset,
    getFirstEpisodeForSeason,
    getLastEpisodeForSeason,
    getSeriesEpisodeByKey
} from '../../selectors/series-episode.selector';
import { updateSeriesSeasonForPortal } from './load-season.saga';
import { SeriesSeason } from '../../models/series-season.model';
import { StateModel } from '../../models/state.model';
import { getSeasonWithOffset, getSeriesSeasonByKey } from '../../selectors/series-season.selector';
import { loadSeriesInformationForPortal } from './load-series.saga';
import { getSeriesByKey } from '../../selectors/series.selector';
import { isVeryFirstEpisode } from '../../utils/series.utils';

export function* getNeighbourEpisode(startEpisodeKey: SeriesEpisode['key'], portalKey: PORTALS, higherNeighbour: boolean) {
    const lastEpisode = getSeriesEpisodeByKey(yield select(), startEpisodeKey);
    if (!lastEpisode) {
        return null;
    }

    if (!higherNeighbour && isVeryFirstEpisode(lastEpisode)) {
        return null;
    }

    const nextEpisode = yield getNeighbourEpisodeForSameSeason(lastEpisode, portalKey, higherNeighbour);
    if (nextEpisode) {
        return nextEpisode;
    }

    return yield getNextEpisodeForNeighbourSeason(lastEpisode.seasonKey, portalKey, higherNeighbour);
}

function* getNeighbourEpisodeForSameSeason(startEpisode: SeriesEpisode, portalKey: PORTALS, higherNeighbour: boolean) {
    const { key, seasonKey, seriesKey } = startEpisode;
    const offset = higherNeighbour ? 1 : -1;
    const neighbourEpisode = getEpisodeWithOffset(yield select(), key, offset);
    if (neighbourEpisode) {
        return neighbourEpisode;
    }

    const series = getSeriesByKey(yield select(), seriesKey);

    yield updateSeriesSeasonForPortal({
        seasonKey,
        portalKey,
        language: series.lastUsedLanguage
    });

    return getEpisodeWithOffset(yield select(), key, offset);
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
    const currentSeason = getSeriesSeasonByKey(state, seasonKey);
    const series = getSeriesByKey(state, currentSeason.seriesKey);

    let neighbourSeason = getSeasonWithOffset(state, seasonKey, offset);
    if (neighbourSeason) {
        yield updateSeriesSeasonForPortal({
            seasonKey: neighbourSeason.key,
            language: series.lastUsedLanguage,
            portalKey,
        });
        return getSeasonWithOffset(yield select(), seasonKey, offset);
    }

    yield loadSeriesInformationForPortal(currentSeason.seriesKey, portalKey);

    const hasNewNeighbourSeason = Boolean(getSeasonWithOffset(yield select(), seasonKey, offset));
    if (!hasNewNeighbourSeason) {
        return null;
    }

    yield updateSeriesSeasonForPortal({
        seasonKey: neighbourSeason.key,
        language: series.lastUsedLanguage,
        portalKey,
    });
    return getSeasonWithOffset(yield select(), seasonKey, offset);

}
