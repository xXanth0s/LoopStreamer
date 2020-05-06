import {MessageType} from '../enum/message-type.enum';
import {Message} from './message.interface';
import {ControllerType} from '../enum/controller.type';
import Series from '../../store/models/series.model';
import { SeriesMetaInfoDto } from '../../dto/series-meta-info.dto';
import { SeriesSeason } from '../../store/models/series-season.model';
import { SeriesEpisodeDto } from '../../dto/series-episode.dto';
import { SeriesInfoDto } from '../../dto/series-info.dto';

export const createGetActiveVideoInformation = (withVideoLink: boolean): Message<boolean, Series> => ({
    type: MessageType.PORTAL_GET_VIDEO_INFORMATION,
    destinationController: ControllerType.PORTAL,
    payload: withVideoLink,
    hasReply: true,
});
export type GetActiveVideoInformation = ReturnType<typeof createGetActiveVideoInformation>;


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
