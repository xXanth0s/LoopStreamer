import { Message } from './message.interface';
import { MessageType } from '../enum/message-type.enum';
import { ControllerType } from '../enum/controller.type';
import Series from '../../store/models/series.model';
import SeriesEpisode from '../../store/models/series-episode.model';


export const createGetContinuableEpisodeMessage = (seriesKey: Series['key']): Message<string, SeriesEpisode> => ({
    type: MessageType.BACKGROUND_DATA_GET_CONTINUABLE_EPISODE,
    destinationController: ControllerType.BACKGROUND_DATA,
    hasReply: true,
    payload: seriesKey
});
export type GetContinuableEpisodeMessage = ReturnType<typeof createGetContinuableEpisodeMessage>;


export const createHasNextEpisodeMessage = (seriesEpisodeKey: Series['key']): Message<string, boolean> => ({
    type: MessageType.BACKGROUND_DATA_GET_HAS_NEXT_EPISODE,
    destinationController: ControllerType.BACKGROUND_DATA,
    hasReply: true,
    payload: seriesEpisodeKey
});
export type HasNextEpisodeMessage = ReturnType<typeof createHasNextEpisodeMessage>;




