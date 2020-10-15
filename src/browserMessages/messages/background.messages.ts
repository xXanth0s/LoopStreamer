import { MessageType } from '../enum/message-type.enum';
import { Message } from './message.interface';
import { ControllerType } from '../enum/controller.type';
import SeriesEpisode from '../../store/models/series-episode.model';
import Series from '../../store/models/series.model';
import { SeriesMetaInfoDto } from '../../dto/series-meta-info.dto';
import { PORTALS } from '../../store/enums/portals.enum';
import { DomElementSize } from '../../dto/dom-element-size.model';

export const createVideoFinishedMessage = (): Message<SeriesEpisode> => ({
    type: MessageType.BACKGROUND_VIDEO_FINISHED,
    destinationController: ControllerType.BACKGROUND,
    hasReply: false,
});
export type VideoFinishedMessage = ReturnType<typeof createVideoFinishedMessage>;


export const createToggleFullscreenModeMessage = (): Message => ({
    type: MessageType.BACKGROUND_TOGGLE_FULLSCREEN,
    destinationController: ControllerType.BACKGROUND,
    hasReply: false,
});
export type ToggleFullscreenModeMessage = ReturnType<typeof createToggleFullscreenModeMessage>;


export const createWindowResizedMessage = (): Message => ({
    type: MessageType.BACKGROUND_WINDOW_RESIZED,
    destinationController: ControllerType.BACKGROUND,
    hasReply: false,
});
export type WindowResizedMessage = ReturnType<typeof createWindowResizedMessage>;


export const createOpenNextVideoMessage = (activeEpisodeKey: Series['key']): Message<Series['key']> => ({
    type: MessageType.BACKGROUND_NEXT_VIDEO,
    destinationController: ControllerType.BACKGROUND,
    payload: activeEpisodeKey,
    hasReply: false,
});
export type OpenNextVideoMessage = ReturnType<typeof createOpenNextVideoMessage>;


export const createOpenPreviousVideoMessage = (activeEpisodeKey: Series['key']): Message<Series['key']> => ({
    type: MessageType.BACKGROUND_PREVIOUS_VIDEO,
    destinationController: ControllerType.BACKGROUND,
    payload: activeEpisodeKey,
    hasReply: false,
});
export type OpenPreviousVideoMessage = ReturnType<typeof createOpenPreviousVideoMessage>;


export const createContinueSeriesMessage = (seriesKey: Series['key']): Message<Series['key']> => ({
    type: MessageType.BACKGROUND_CONTINUE_SERIES,
    destinationController: ControllerType.BACKGROUND,
    payload: seriesKey,
    hasReply: false,
});
export type StartSeriesMessage = ReturnType<typeof createContinueSeriesMessage>;


export const createGetAllAvailableSeriesFromPortalMessage = (portal: PORTALS): Message<PORTALS, SeriesMetaInfoDto[]> => ({
    type: MessageType.BACKGROUND_GET_ALL_SERIES_FROM_PORTAL,
    destinationController: ControllerType.BACKGROUND,
    hasReply: true,
    payload: portal
});
export type GetAllAvailableSeriesFromPortalMessage = ReturnType<typeof createGetAllAvailableSeriesFromPortalMessage>;


export const createGetSeriesInformationFromPortalMessage = (seriesMetaInfoDto: SeriesMetaInfoDto): Message<SeriesMetaInfoDto, Series> => ({
    type: MessageType.BACKGROUND_GET_SERIES_INFORMATION,
    destinationController: ControllerType.BACKGROUND,
    hasReply: true,
    payload: seriesMetaInfoDto
});
export type GetSeriesInformationFromPortalMessage = ReturnType<typeof createGetSeriesInformationFromPortalMessage>;


export const createGetSeriesEpisodesForSeasonMessage = (portal: PORTALS, seriesSeasonKey: string) : Message<{portal: PORTALS, seriesSeasonKey: string}, SeriesEpisode[]> => ({
    type: MessageType.BACKGROUND_GET_SERIES_EPISODES_FOR_SEASON,
    destinationController: ControllerType.BACKGROUND,
    hasReply: true,
    payload: {
        portal,
        seriesSeasonKey
    }
});
export type GetSeriesEpisodesForSeasonMessage = ReturnType<typeof createGetSeriesEpisodesForSeasonMessage>;


export const createStartEpisodeMessage = (episodeKey: SeriesEpisode['key'], portal: PORTALS) : Message<{episodeKey: SeriesEpisode['key'], portal: PORTALS}, boolean> => ({
    type: MessageType.BACKGROUND_START_EPISODE,
    destinationController: ControllerType.BACKGROUND,
    hasReply: true,
    payload: {
        portal,
        episodeKey
    }
});
export type StartEpisodeMessage = ReturnType<typeof createStartEpisodeMessage>;


export const createRecaptchaRecognizedMessage = (domElementSize: DomElementSize) : Message<DomElementSize> => ({
    type: MessageType.BACKGROUND_RECAPTCHA_RECOGNIZED,
    destinationController: ControllerType.BACKGROUND,
    hasReply: false,
    payload: domElementSize
});
export type RecaptchaRecognizedMessage = ReturnType<typeof createRecaptchaRecognizedMessage>;


export const createMinimizeWindowMessage = (windowId: number) : Message<number> => ({
    type: MessageType.BACKGROUND_MINIMIZE_WINDOW,
    destinationController: ControllerType.BACKGROUND,
    hasReply: false,
    payload: windowId
});
export type MinimizeWindowMessage = ReturnType<typeof createMinimizeWindowMessage>;


export const createToggleWindowFullscreenMessage = (windowId: number) : Message<number> => ({
    type: MessageType.BACKGROUND_TOGGLE_WINDOW_FULLSCREEN,
    destinationController: ControllerType.BACKGROUND,
    hasReply: false,
    payload: windowId
});
export type ToggleWindowFullscreenMessage = ReturnType<typeof createToggleWindowFullscreenMessage>;


export const createToggleWindowMaximizationMessage = (windowId: number) : Message<number> => ({
    type: MessageType.BACKGROUND_TOGGLE_WINDOW_MAXIMIZATION,
    destinationController: ControllerType.BACKGROUND,
    hasReply: false,
    payload: windowId
});
export type ToggleWindowMaximizationMessage = ReturnType<typeof createToggleWindowMaximizationMessage>;


export const createCloseWindowMessage = (windowId: number) : Message<number> => ({
    type: MessageType.BACKGROUND_CLOSE_WINDOW,
    destinationController: ControllerType.BACKGROUND,
    hasReply: false,
    payload: windowId
});
export type CloseWindowMessage = ReturnType<typeof createCloseWindowMessage>;


