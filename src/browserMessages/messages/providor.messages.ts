import { Message } from './message.interface';
import { MessageType } from '../enum/message-type.enum';
import { ControllerType } from '../enum/controller.type';
import SeriesEpisode from '../../store/models/series-episode.model';
import { PROVIDORS } from '../../store/enums/providors.enum';

export const createStartVideoMessage = (episodeKey: SeriesEpisode['key'],
                                        providor: PROVIDORS): Message<{episodeKey: SeriesEpisode['key'], providor: PROVIDORS}, boolean> => ({
    type: MessageType.PROVIDOR_START_VIDEO,
    destinationController: ControllerType.PROVIDOR,
    payload: { episodeKey, providor },
    hasReply: true,
});

export type StartVideoMessage = ReturnType<typeof createStartVideoMessage>;
