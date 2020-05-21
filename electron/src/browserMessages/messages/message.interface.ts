import { MessageType } from '../enum/message-type.enum';
import { ControllerType } from '../enum/controller.type';

export interface Message<T = undefined, R = void> {
    type: MessageType;
    sourceController?: ControllerType;
    destinationController: ControllerType;
    payload?: T;
    hasReply: boolean;
}
