import { MessageType } from '../enum/message-type.enum';
import { Message } from './message.interface';
import { ControllerType } from '../enum/controller.type';
import { SeriesMetaInfoDto } from '../../dto/series-meta-info.dto';
import { SeriesEpisodeDto } from '../../dto/series-episode.dto';
import { SeriesInfoDto } from '../../dto/series-info.dto';
import { PROVIDORS } from '../../store/enums/providors.enum';
import SeriesEpisode from '../../store/models/series-episode.model';

export const createGetProvidorLinkForEpisode = (episodeInfo: SeriesEpisode, providor: PROVIDORS): Message<{ providor: PROVIDORS, episodeInfo: SeriesEpisode }, string> => ({
    type: MessageType.PORTAL_GET_PROVIDOR_LINK_FOR_EPISODE,
    destinationController: ControllerType.PORTAL,
    hasReply: true,
    payload: { providor, episodeInfo }
});
export type GetProvidorLinkForEpisode = ReturnType<typeof createGetProvidorLinkForEpisode>;


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


export const createGetAllSeriesFromPortalMessage = (): Message<undefined, SeriesMetaInfoDto[]> => ({
    type: MessageType.PORTAL_GET_ALL_SERIES,
    destinationController: ControllerType.PORTAL,
    hasReply: true,
});
export type GetAllSeriesFromPortalMessage = ReturnType<typeof createGetAllSeriesFromPortalMessage>;

export const createGetSeriesInformationMessage = (): Message<undefined, SeriesInfoDto> => ({
    type: MessageType.PORTAL_GET_SERIES_META_INFORMATION,
    destinationController: ControllerType.PORTAL,
    hasReply: true,
});
export type GetSeriesInformationMessage = ReturnType<typeof createGetSeriesInformationMessage>;

export const createGetEpisodesForSeasonMessage = (seasonNumber: number): Message<number, SeriesEpisodeDto[]> => ({
    type: MessageType.PORTAL_GET_EPISODES_FOR_SEASON,
    destinationController: ControllerType.PORTAL,
    hasReply: true,
    payload: seasonNumber,
});
export type GetEpisodesForSeasonMessage = ReturnType<typeof createGetEpisodesForSeasonMessage>;
