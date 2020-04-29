import Series from '../../store/models/series.model';
import {Message} from './message.interface';
import {MessageType} from '../enum/message-type.enum';
import {ControllerType} from '../enum/controller.type';

export const createStartVideoProvidorMessage = (seriesInfo: Series): Message<Series> => ({
    type: MessageType.PROVIDOR_START_VIDEO,
    destinationController: ControllerType.PROVIDOR,
    payload: seriesInfo,
    hasReply: false,
});

export type StartVideoProvidorMessage = ReturnType<typeof createStartVideoProvidorMessage>;
