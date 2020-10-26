import { MessageType } from '../enum/message-type.enum';
import { Message } from './message.interface';
import { ControllerType } from '../enum/controller.type';
import SeriesEpisode from '../../store/models/series-episode.model';
import Series from '../../store/models/series.model';
import { PORTALS } from '../../store/enums/portals.enum';
import { DomElementSize } from '../../dto/dom-element-size.model';

export const createVideoFinishedMessage = (episodeKey: SeriesEpisode['key']): Message<SeriesEpisode['key']> => ({
    type: MessageType.BACKGROUND_VIDEO_FINISHED,
    destinationController: ControllerType.BACKGROUND,
    payload: episodeKey,
    hasReply: false,
});
export type VideoFinishedMessage = ReturnType<typeof createVideoFinishedMessage>;

export const createContinueAutoplayForEpisodeMessage = (episodeKey: SeriesEpisode['key']): Message<SeriesEpisode['key']> => ({
    type: MessageType.BACKGROUND_CONTINUE_AUTOPLAY,
    destinationController: ControllerType.BACKGROUND,
    payload: episodeKey,
    hasReply: false,
});
export type ContinueAutoplayForEpisodeMessage = ReturnType<typeof createContinueAutoplayForEpisodeMessage>;

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


export const createPortalSelectedInAppMessage = (portal: PORTALS): Message<PORTALS> => ({
    type: MessageType.BACKGROUND_PORTAL_SELECTED_IN_APP,
    destinationController: ControllerType.BACKGROUND,
    hasReply: true,
    payload: portal
});
export type PortalSelectedInAppMessage = ReturnType<typeof createPortalSelectedInAppMessage>;


export const createSeriesSelectedInAppMessage = (seriesKey: Series['key'], portal: PORTALS): Message<{ seriesKey: Series['key'], portal: PORTALS }> => ({
    type: MessageType.BACKGROUND_SERIES_SELECTED_IN_APP,
    destinationController: ControllerType.BACKGROUND,
    hasReply: true,
    payload: {
        seriesKey,
        portal
    }
});
export type SeriesSelectedInAppMessage = ReturnType<typeof createSeriesSelectedInAppMessage>;


export const createSeriesSeasonSelectedInAppMessage = (seriesSeasonKey: string, portal: PORTALS): Message<{ seriesSeasonKey: string, portal: PORTALS }> => ({
    type: MessageType.BACKGROUND_SERIES_SEASON_SELECTED_IN_APP,
    destinationController: ControllerType.BACKGROUND,
    hasReply: true,
    payload: {
        portal,
        seriesSeasonKey
    }
});
export type SeriesSeasonSelectedInAppMessage = ReturnType<typeof createSeriesSeasonSelectedInAppMessage>;


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


