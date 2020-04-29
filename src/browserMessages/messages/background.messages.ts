import {MessageType} from '../enum/message-type.enum';
import {Message} from './message.interface';
import {ControllerType} from '../enum/controller.type';
import SeriesEpisodeInfo from '../../store/models/series-episode-info.model';
import Series from '../../store/models/series.model';

export const createVideoFinishedMessage = (): Message<SeriesEpisodeInfo> => ({
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

export const createOpenNextVideoMessage = (): Message => ({

    type: MessageType.BACKGROUND_NEXT_VIDEO,
    destinationController: ControllerType.BACKGROUND,
    hasReply: false,
});
export type OpenNextVideoMessage = ReturnType<typeof createOpenNextVideoMessage>;

export const createOpenPreviousVideoMessage = (): Message => ({

    type: MessageType.BACKGROUND_PREVIOUS_VIDEO,
    destinationController: ControllerType.BACKGROUND,
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


export const createStartActiveSeries = (): Message => ({
    type: MessageType.BACKGROUND_START_ACTIVE_SERIES,
    destinationController: ControllerType.BACKGROUND,
    hasReply: false,
});
export type StartActiveSeries = ReturnType<typeof createStartActiveSeries>;

