import { put } from 'redux-saga/effects';
import { PortalSeriesEpisodeDto } from '../../../dto/portal-series-episode.dto';
import { generateLinkForProvidorLink, generateLinkForSeriesEpisodeDto } from '../../utils/link.utils';
import { LINK_TYPE } from '../../enums/link-type.enum';
import { updateOrAddMultipleLinksAction } from '../../reducers/link.reducer';
import { ProvidorLink } from '../../../background/models/providor-link.model';
import { SeriesEpisode } from '../../models/series-episode.model';
import { PORTALS } from '../../enums/portals.enum';
import { LANGUAGE } from '../../enums/language.enum';
import { Logger } from '../../../shared/services/logger';
import { Series } from '../../models/series.model';

export function* addMultipleEpisodesSaga(seriesKey: Series['key'], episodes: PortalSeriesEpisodeDto[]) {
    if (!episodes || episodes.length === 0) {
        Logger.error('[addMultipleEpisodesSaga] tried to add empty SeriesEpisodeDto array');
        return;
    }

    const episodeLinks = episodes.map(episode => {
        return generateLinkForSeriesEpisodeDto(seriesKey, episode, LINK_TYPE.PORTAL_EPISODE_LINK);
    }).flat();

    yield put(updateOrAddMultipleLinksAction(episodeLinks));
}

export function* addSeriesEpisodeProvidorLinks(providorLinks: ProvidorLink[],
                                               episodeKey: SeriesEpisode['key'],
                                               portalKey: PORTALS,
                                               language: LANGUAGE) {
    if (!providorLinks || providorLinks.length === 0) {
        Logger.error('[addSeriesEpisodeProvidorLinks] tried to add empty ProvidorLink array');
        return false;
    }

    const links = providorLinks.map(link => generateLinkForProvidorLink(episodeKey,
                                                                        link,
                                                                        language,
                                                                        LINK_TYPE.PORTAL_EPISODE_LINK,
                                                                        portalKey));

    yield put(updateOrAddMultipleLinksAction(links));
}
