import { MessageType } from '../enum/message-type.enum';
import { Message } from './message.interface';
import { ControllerType } from '../enum/controller.type';
import { SeriesInfoDto } from '../../dto/series-info.dto';
import { PROVIDORS } from '../../store/enums/providors.enum';
import SeriesEpisode from '../../store/models/series-episode.model';
import { LANGUAGE } from '../../store/enums/language.enum';
import { ProvidorLink } from '../../background/models/providor-link.model';
import { SeriesSeasonDto } from '../../dto/series-season.dto';

export const createGetResolvedProvidorLinkForEpisodeMessage = (episodeInfo: SeriesEpisode, providor: PROVIDORS): Message<{ providor: PROVIDORS, episodeInfo: SeriesEpisode }, string> => ({
    type: MessageType.PORTAL_GET_RESOLVED_PROVIDOR_LINK_FOR_EPISODE,
    destinationController: ControllerType.PORTAL,
    hasReply: true,
    payload: { providor, episodeInfo }
});
export type GetResolvedProvidorLinkForEpisode = ReturnType<typeof createGetResolvedProvidorLinkForEpisodeMessage>;

export const createGetAllProvidorLinksForEpisodeMessage = (language: LANGUAGE): Message<{ language: LANGUAGE }, ProvidorLink[]> => ({
    type: MessageType.PORTAL_GET_ALL_PROVIDOR_LINKS,
    destinationController: ControllerType.PORTAL,
    hasReply: true,
    payload: { language }
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


export const createGetAllSeriesFromPortalMessage = (): Message<undefined, SeriesInfoDto[]> => ({
    type: MessageType.PORTAL_GET_ALL_SERIES,
    destinationController: ControllerType.PORTAL,
    hasReply: true,
});
export type GetAllSeriesFromPortalMessage = ReturnType<typeof createGetAllSeriesFromPortalMessage>;

export const createGetDetailedSeriesInformationMessage = (): Message<undefined, SeriesInfoDto> => ({
    type: MessageType.PORTAL_GET_SERIES_META_INFORMATION,
    destinationController: ControllerType.PORTAL,
    hasReply: true,
});
export type GetDetailedSeriesInformationMessage = ReturnType<typeof createGetDetailedSeriesInformationMessage>;

export const createGetSeasonInfoMessage = (seasonNumber: string): Message<{ seasonNumber: string }, SeriesSeasonDto> => ({
    type: MessageType.PORTAL_GET_SEASON_INFO,
    destinationController: ControllerType.PORTAL,
    hasReply: true,
    payload: { seasonNumber },
});
export type GetSeasonInfoMessage = ReturnType<typeof createGetSeasonInfoMessage>;
