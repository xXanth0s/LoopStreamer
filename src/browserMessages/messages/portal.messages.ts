import { MessageType } from '../enum/message-type.enum';
import { Message } from './message.interface';
import { ControllerType } from '../enum/controller.type';
import { SeriesEpisodeDto } from '../../dto/series-episode.dto';
import { SeriesInfoDto } from '../../dto/series-info.dto';
import { PROVIDORS } from '../../store/enums/providors.enum';
import SeriesEpisode from '../../store/models/series-episode.model';
import { LANGUAGE } from '../../store/enums/language.enum';
import { ProvidorLink } from '../../background/models/providor-link.model';

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

export const createGetEpisodesForSeasonMessage = (seasonNumber: number): Message<number, SeriesEpisodeDto[]> => ({
    type: MessageType.PORTAL_GET_EPISODES_FOR_SEASON,
    destinationController: ControllerType.PORTAL,
    hasReply: true,
    payload: seasonNumber,
});
export type GetEpisodesForSeasonMessage = ReturnType<typeof createGetEpisodesForSeasonMessage>;
