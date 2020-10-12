import { MessageType } from '../enum/message-type.enum';
import { Message } from './message.interface';
import { ControllerType } from '../enum/controller.type';

export const createStartTestRecaptchaMessage = (): Message => ({
    type: MessageType.TEST_CONTENT_START_TEST_RECAPTCHA,
    destinationController: ControllerType.TEST,
    hasReply: false,
});
export type StartTestRecaptchaMessage = ReturnType<typeof createStartTestRecaptchaMessage>;


export const createStartTestEpisodeOverBS = (): Message => ({
    type: MessageType.TEST_BACKGROUND_START_TEST_EPISODE_OVER_BS,
    destinationController: ControllerType.BACKGROUND,
    hasReply: false,
});
export type StartTestEpisodeOverBS = ReturnType<typeof createStartTestEpisodeOverBS>;

