import {MessageType} from '../enum/message-type.enum';
import {Message} from './message.interface';
import {ControllerType} from '../enum/controller.type';
import SeriesEpisodeInfo from '../../store/models/series-episode-info.model';
import Series from '../../store/models/series.model';

export const createVideoFinishedMessage = (): Message<SeriesEpisodeInfo> => ({
    type: MessageType.BACKGROUND_VIDEO_FINISHED,
    destinationController: ControllerType.BACKGROUND
});
export type VideoFinishedMessage = ReturnType<typeof createVideoFinishedMessage>;

export const createToggleFullscreenModeMessage = (): Message<undefined> => ({

    type: MessageType.BACKGROUND_TOGGLE_FULLSCREEN,
    destinationController: ControllerType.BACKGROUND
});
export type ToggleFullscreenModeMessage = ReturnType<typeof createToggleFullscreenModeMessage>;

export const createWindowResizedMessage = (): Message<undefined> => ({

    type: MessageType.BACKGROUND_WINDOW_RESIZED,
    destinationController: ControllerType.BACKGROUND
});
export type WindowResizedMessage = ReturnType<typeof createWindowResizedMessage>;

export const createOpenNextVideoMessage = (): Message<undefined> => ({

    type: MessageType.BACKGROUND_NEXT_VIDEO,
    destinationController: ControllerType.BACKGROUND
});
export type OpenNextVideoMessage = ReturnType<typeof createOpenNextVideoMessage>;

export const createOpenPreviousVideoMessage = (): Message<undefined> => ({

    type: MessageType.BACKGROUND_PREVIOUS_VIDEO,
    destinationController: ControllerType.BACKGROUND
});
export type OpenPreviousVideoMessage = ReturnType<typeof createOpenPreviousVideoMessage>;


export const createContinueSeriesMessage = (seriesKey: Series['key']): Message<Series['key']> => ({
    type: MessageType.BACKGROUND_CONTINUE_SERIES,
    destinationController: ControllerType.BACKGROUND,
    payload: seriesKey
});
export type StartSeriesMessage = ReturnType<typeof createContinueSeriesMessage>;


export const createStartActiveSeries = (): Message<undefined> => ({
    type: MessageType.BACKGROUND_START_ACTIVE_SERIES,
    destinationController: ControllerType.BACKGROUND,
});
export type StartActiveSeries = ReturnType<typeof createStartActiveSeries>;

