import { MessageType } from '../enum/message-type.enum';
import { Message } from './message.interface';
import { ControllerType } from '../enum/controller.type';
import { PortalSeriesInfoDto } from '../../dto/portal-series-info.dto';
import { PROVIDORS } from '../../store/enums/providors.enum';
import SeriesEpisode from '../../store/models/series-episode.model';
import { LANGUAGE } from '../../store/enums/language.enum';
import { ProvidorLink } from '../../background/models/providor-link.model';
import { PortalSeriesSeasonDto } from '../../dto/portal-series-season.dto';
import { PORTALS } from '../../store/enums/portals.enum';

export const createGetResolvedProvidorLinkForEpisodeMessage = (episodeInfo: SeriesEpisode, providor: PROVIDORS, portal: PORTALS):
    Message<{ providor: PROVIDORS, episodeInfo: SeriesEpisode, portal: PORTALS }, string> => ({
    type: MessageType.PORTAL_GET_RESOLVED_PROVIDOR_LINK_FOR_EPISODE,
    destinationController: ControllerType.PORTAL,
    hasReply: true,
    payload: { providor, episodeInfo, portal }
});
export type GetResolvedProvidorLinkForEpisode = ReturnType<typeof createGetResolvedProvidorLinkForEpisodeMessage>;

export const createGetAllProvidorLinksForEpisodeMessage = (language: LANGUAGE, portal: PORTALS): Message<{ language: LANGUAGE, portal: PORTALS }, ProvidorLink[]> => ({
    type: MessageType.PORTAL_GET_ALL_PROVIDOR_LINKS,
    destinationController: ControllerType.PORTAL,
    hasReply: true,
    payload: {
        language,
        portal,
    }
});
export type GetAllProvidorLinksForEpisodeMessage = ReturnType<typeof createGetAllProvidorLinksForEpisodeMessage>;


export const createGetNextVideoLinkMessage = (): Message<undefined, string> => ({
    type: MessageType.PORTAL_NEXT_EPISODE_LINK,
    destinationController: ControllerType.PORTAL,
    hasReply: true,
});
export type GetNextVideoLinkMessage = ReturnType<typeof createGetNextVideoLinkMessage>;


export const createGetPreviousVideoLinkMessage = (): Message<undefined, string> => ({
    type: MessageType.PORTAL_PREVIOUS_EPISODE_LINK,
    destinationController: ControllerType.PORTAL,
    hasReply: true,
});
export type GetPreviousVideoLinkMessage = ReturnType<typeof createGetPreviousVideoLinkMessage>;


export const createGetAllSeriesFromPortalMessage = (portal: PORTALS): Message<{ portal: PORTALS }, PortalSeriesInfoDto[]> => ({
    type: MessageType.PORTAL_GET_ALL_SERIES,
    destinationController: ControllerType.PORTAL,
    payload: {
        portal
    },
    hasReply: true,
});
export type GetAllSeriesFromPortalMessage = ReturnType<typeof createGetAllSeriesFromPortalMessage>;

export const createGetDetailedSeriesInformationMessage = (portal: PORTALS): Message<{ portal: PORTALS }, PortalSeriesInfoDto> => ({
    type: MessageType.PORTAL_GET_SERIES_META_INFORMATION,
    destinationController: ControllerType.PORTAL,
    payload: {
        portal
    },
    hasReply: true,
});
export type GetDetailedSeriesInformationMessage = ReturnType<typeof createGetDetailedSeriesInformationMessage>;

export const createGetSeasonInfoMessage = (seasonNumber: string, portal: PORTALS): Message<{ seasonNumber: string, portal: PORTALS }, PortalSeriesSeasonDto> => ({
    type: MessageType.PORTAL_GET_SEASON_INFO,
    destinationController: ControllerType.PORTAL,
    hasReply: true,
    payload: {
        seasonNumber,
        portal,
    },
});
export type GetSeasonInfoMessage = ReturnType<typeof createGetSeasonInfoMessage>;
