import { MessageType } from '../enum/message-type.enum';
import { Message } from './message.interface';
import { ControllerType } from '../enum/controller.type';

export const createStartTestRecaptchaMessage = (): Message => ({
    type: MessageType.TEST_CONTENT_START_TEST_RECAPTCHA,
    destinationController: ControllerType.TEST,
    hasReply: false,
});
export type StartTestRecaptchaMessage = ReturnType<typeof createStartTestRecaptchaMessage>;

export const createTestNotificationMessage = (): Message => ({
    type: MessageType.TEST_CONTENT_START_TEST_NOTIFICATION,
    destinationController: ControllerType.TEST,
    hasReply: false,
});
export type TestNotificationMessage = ReturnType<typeof createTestNotificationMessage>;

export const createOpenTestPageMessage = (): Message => ({
    type: MessageType.TEST_BACKGROUND_OPEN_TEST_PAGE,
    destinationController: ControllerType.BACKGROUND,
    hasReply: false,
});
export type OpenTestPageMessage = ReturnType<typeof createOpenTestPageMessage>;


export const createStartTestEpisodeOverBSMessage = (): Message => ({
    type: MessageType.TEST_BACKGROUND_START_TEST_EPISODE_OVER_BS,
    destinationController: ControllerType.BACKGROUND,
    hasReply: false,
});
export type StartTestEpisodeOverBSMessage = ReturnType<typeof createStartTestEpisodeOverBSMessage>;


export const createStartTestRecaptchaBackgroundMessage = (): Message => ({
    type: MessageType.TEST_BACKGROUND_START_RECAPTCHA,
    destinationController: ControllerType.BACKGROUND,
    hasReply: false,
});
export type StartTestRecaptchaBackgroundMessage = ReturnType<typeof createStartTestRecaptchaBackgroundMessage>;


export const createShowAllWindowsMessage = (): Message => ({
    type: MessageType.TEST_BACKGROUND_SHOW_ALL_WINDOWS,
    destinationController: ControllerType.BACKGROUND,
    hasReply: false,
});
export type ShowAllWindowsMessage = ReturnType<typeof createShowAllWindowsMessage>;

