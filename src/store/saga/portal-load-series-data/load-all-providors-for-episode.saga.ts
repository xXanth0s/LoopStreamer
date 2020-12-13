import { call } from 'redux-saga/effects';
import SeriesEpisode from '../../models/series-episode.model';
import { LANGUAGE } from '../../enums/language.enum';
import { getPortalController } from '../../../background/container/container.utils';
import { PORTALS } from '../../enums/portals.enum';
import { ProvidorLink } from '../../../background/models/providor-link.model';
import { addSeriesEpisodeProvidorLinks } from '../add-data/add-series-episode.saga';

export function* loadAllProvidorLinksForEpisode(episodeKey: SeriesEpisode['key'],
                                                portalKey: PORTALS,
                                                language: LANGUAGE) {
    const portalController = getPortalController();
    const providorLinks: ProvidorLink[] = yield call([ portalController, portalController.getAllProviderPortalLinksForEpisode ], episodeKey, portalKey, language);

    yield addSeriesEpisodeProvidorLinks(providorLinks, episodeKey, portalKey, language);
}
