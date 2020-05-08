import Series from '../../store/models/series.model';
import {Message} from './message.interface';
import {MessageType} from '../enum/message-type.enum';
import {ControllerType} from '../enum/controller.type';
import SeriesEpisode from '../../store/models/series-episode.model';
import { PROVIDORS } from '../../store/enums/providors.enum';

export const createStartVideoProvidorMessage = (episodeInfo: SeriesEpisode, providor: PROVIDORS): Message<{episodeInfo: SeriesEpisode, providor: PROVIDORS}> => ({
    type: MessageType.PROVIDOR_START_VIDEO,
    destinationController: ControllerType.PROVIDOR,
    payload: { episodeInfo, providor },
    hasReply: false,
});

export type StartVideoProvidorMessage = ReturnType<typeof createStartVideoProvidorMessage>;
