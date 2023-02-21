import { select } from 'redux-saga/effects';
import { SeriesEpisode } from '../../models/series-episode.model';
import { PORTALS } from '../../enums/portals.enum';
import { getNextEpisode, getPreviousEpisode } from '../../selectors/series-episode.selector';
import { updateSeriesSeasonForPortal } from './load-season.saga';
import { getPortalLinksForSeriesEpisodePortalAndLanguage } from '../../selectors/línk.selector';
import { LANGUAGE } from '../../enums/language.enum';

export function* getPortalLinkForNextEpisode(startEpisodeKey: SeriesEpisode['key'],
                                             portalKey: PORTALS, language: LANGUAGE) {
    const nextEpisode = getNextEpisode(yield select(), startEpisodeKey);
    if (!nextEpisode) {
        return null;
    }

    let portalLinks = getPortalLinksForSeriesEpisodePortalAndLanguage(yield select(),
                                                                      nextEpisode.key,
                                                                      portalKey,
                                                                      language);
    if (!portalLinks.length) {
        yield updateSeriesSeasonForPortal({
            seasonKey: nextEpisode.seasonKey,
            forceUpdate: false,
            portalKey,
            language,
        });
        portalLinks = getPortalLinksForSeriesEpisodePortalAndLanguage(yield select(),
                                                                      nextEpisode.key,
                                                                      portalKey,
                                                                      language);
    }

    return portalLinks[0];
}

export function* getPortalLinkForPreviousEpisode(startEpisodeKey: SeriesEpisode['key'],
                                                 portalKey: PORTALS,
                                                 language: LANGUAGE) {
    const previousEpisode = getPreviousEpisode(yield select(), startEpisodeKey);
    if (!previousEpisode) {
        return null;
    }

    let portalLinks = getPortalLinksForSeriesEpisodePortalAndLanguage(yield select(),
                                                                      previousEpisode.key,
                                                                      portalKey,
                                                                      language);
    if (!portalLinks.length) {
        yield updateSeriesSeasonForPortal({
            seasonKey: previousEpisode.seasonKey,
            forceUpdate: false,
            portalKey,
            language,
        });
        portalLinks = getPortalLinksForSeriesEpisodePortalAndLanguage(yield select(),
                                                                      previousEpisode.key,
                                                                      portalKey,
                                                                      language);
    }

    return portalLinks[0];
}
