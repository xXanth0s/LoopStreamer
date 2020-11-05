import { MessageType } from '../enum/message-type.enum';
import { Message } from './message.interface';
import { ControllerType } from '../enum/controller.type';
import SeriesEpisode from '../../store/models/series-episode.model';
import Series from '../../store/models/series.model';
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


