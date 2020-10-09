import { MessageType } from '../enum/message-type.enum';
import { Message } from './message.interface';
import { ControllerType } from '../enum/controller.type';

export const createStartTestRecaptcha = (): Message => ({
    type: MessageType.TEST_CONTENT_START_TEST_RECAPTCHA,
    destinationController: ControllerType.TEST,
    hasReply: false,
});
export type StartTestRecaptcha = ReturnType<typeof createStartTestRecaptcha>;

