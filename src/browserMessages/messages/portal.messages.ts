import {MessageType} from '../enum/message-type.enum';
import {Message} from './message.interface';
import {ControllerType} from '../enum/controller.type';
import Series from '../../store/models/series.model';

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
