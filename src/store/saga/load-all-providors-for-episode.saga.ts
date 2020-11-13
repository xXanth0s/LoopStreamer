import SeriesEpisode from '../models/series-episode.model';
import { LANGUAGE } from '../enums/language.enum';
import { call, put } from 'redux-saga/effects';
import { getPortalController } from '../../background/container/container.utils';
import { PORTALS } from '../enums/portals.enum';
import { updateOrAddMultipleLinksAction } from '../reducers/link.reducer';
import { ProvidorLink } from '../../background/models/providor-link.model';
import { LINK_TYPE } from '../enums/link-type.enum';
import { generateLinkForProvidorLink } from '../utils/link.utils';

export function* loadAllProvidorLinksForEpisode(episodeKey: SeriesEpisode['key'],
                                                portalKey: PORTALS,
                                                language: LANGUAGE) {
    const portalController = getPortalController();
    const providorLinks: ProvidorLink[] = yield call([ portalController, portalController.getAllProviderPortalLinksForEpisode ], episodeKey, portalKey, language);

    if (providorLinks.length === 0) {
        return false;
    }

    const links = providorLinks.map(link => {
        return generateLinkForProvidorLink(episodeKey, link, language, LINK_TYPE.PORTAL_EPISODE_LINK, portalKey);
    });

    yield put(updateOrAddMultipleLinksAction(links));
}
