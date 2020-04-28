import {MessageType} from '../enum/message-type.enum';
import {Message} from './message.interface';
import {ControllerType} from '../enum/controller.type';

export const createGetActiveVideoInformation = (withVideoLink: boolean): Message<boolean> => ({
    type: MessageType.PORTAL_GET_VIDEO_INFORMATION,
    destinationController: ControllerType.PORTAL,
    payload: withVideoLink
});

export type GetActiveVideoInformation = ReturnType<typeof createGetActiveVideoInformation>;

export const createGetNextVideoLinkMessage = (): Message<undefined> => ({
    type: MessageType.PORTAL_NEXT_EPISODE_LINK,
    destinationController: ControllerType.PORTAL
});

export type GetNextVideoLinkMessage = ReturnType<typeof createGetNextVideoLinkMessage>;

export const createGetPreviousVideoLinkMessage = (): Message<undefined> => ({
    type: MessageType.PORTAL_PREVIOUS_EPISODE_LINK,
    destinationController: ControllerType.PORTAL
});

export type GetPreviousVideoLinkMessage = ReturnType<typeof createGetPreviousVideoLinkMessage>;
