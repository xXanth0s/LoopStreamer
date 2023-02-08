import { Message } from './message.interface';
import { MessageType } from '../enum/message-type.enum';
import { ControllerType } from '../enum/controller.type';
import { SeriesEpisode } from '../../store/models/series-episode.model';
import { PROVIDORS } from '../../store/enums/providors.enum';
import { PORTALS } from '../../store/enums/portals.enum';
import { VIDEO_PREPARATION_STATUS } from '../enum/video-preparation-status.enum';

export const createStartVideoMessage = (episodeKey: SeriesEpisode['key'],
                                        providor: PROVIDORS,
                                        linkSourcePortal: PORTALS): Message<{
    episodeKey: SeriesEpisode['key'];
    providor: PROVIDORS;
    linkSourcePortal: PORTALS;
}, VIDEO_PREPARATION_STATUS> => ({
    type: MessageType.PROVIDOR_START_VIDEO,
    destinationController: ControllerType.PROVIDOR,
    payload: { episodeKey, providor, linkSourcePortal },
    hasReply: true,
});

export type StartVideoMessage = ReturnType<typeof createStartVideoMessage>;
