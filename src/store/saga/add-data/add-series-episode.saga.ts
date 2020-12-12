import { PortalSeriesEpisodeDto } from '../../../dto/portal-series-episode.dto';
import { mapSeriesEpisodeDtoToSeriesEpisode } from '../../utils/series.utils';
import { put } from 'redux-saga/effects';
import { updateOrAddMultipleSeriesEpisodeAction } from '../../reducers/series-episode.reducer';
import { generateLinkForProvidorLink, generateLinkForSeriesEpisodeDto } from '../../utils/link.utils';
import { LINK_TYPE } from '../../enums/link-type.enum';
import { updateOrAddMultipleLinksAction } from '../../reducers/link.reducer';
import { ProvidorLink } from '../../../background/models/providor-link.model';
import SeriesEpisode from '../../models/series-episode.model';
import { PORTALS } from '../../enums/portals.enum';
import { LANGUAGE } from '../../enums/language.enum';
import { Logger } from '../../../shared/services/logger';

export function* addMultipleEpisodesSaga(episodes: PortalSeriesEpisodeDto[]) {
    if (!episodes || episodes.length === 0) {
        Logger.error(`[addMultipleEpisodesSaga] tried to add empty SeriesEpisodeDto array`);
        return;
    }

    const convertedEpisodes = episodes.map(mapSeriesEpisodeDtoToSeriesEpisode);
    yield put(updateOrAddMultipleSeriesEpisodeAction(convertedEpisodes));

    const episodeLinks = episodes.map(episode => generateLinkForSeriesEpisodeDto(episode, LINK_TYPE.PORTAL_EPISODE_LINK)).flat();
    yield put(updateOrAddMultipleLinksAction(episodeLinks));
}


export function* addSeriesEpisodeProvidorLinks(providorLinks: ProvidorLink[],
                                               episodeKey: SeriesEpisode['key'],
                                               portalKey: PORTALS,
                                               language: LANGUAGE) {
    if (!providorLinks || providorLinks.length === 0) {
        Logger.error(`[addSeriesEpisodeProvidorLinks] tried to add empty ProvidorLink array`);
        return false;
    }

    const links = providorLinks.map(link => {
        return generateLinkForProvidorLink(episodeKey, link, language, LINK_TYPE.PORTAL_EPISODE_LINK, portalKey);
    });

    yield put(updateOrAddMultipleLinksAction(links));

}
