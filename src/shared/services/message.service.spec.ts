import { MessageService } from './message.service';
import { StoreService } from './store.service';
import { Container } from 'inversify';
import { SHARED_TYPES } from '../constants/SHARED_TYPES';


describe('MessageService', () => {
    let service: MessageService;
    let storeServiceMock: jest.Mocked<StoreService>;
    let container: Container;

    beforeEach(() => {
        container = new Container();
        storeServiceMock = mockService(StoreService);
        container.bind<MessageService>(SHARED_TYPES.MessageService).to(MessageService);
        container.bind<StoreService>(SHARED_TYPES.StoreService).toConstantValue(storeServiceMock);

        service = container.get(SHARED_TYPES.MessageService);
    });

    it('should be created', () => {
        expect(service).toBeDefined();
        expect(service.storeService).toEqual(storeServiceMock);
    });

    describe('sendMessageToBackground', () => {

    });

    describe('sendMessageToPortalTab', () => {
        it('should not send message, when no portal tab id exists', () => {
            const message: Message<null> = {
                destinationController: ControllerType.PORTAL,
                sourceController: ControllerType.OPTIONS,
                type: MessageType.BACKGROUND_PREVIOUS_VIDEO,
                payload: null
            };

            storeServiceMock.selectSync.mockReturnValue(null);

            service.sendMessageToPortalTab(message);

            expect(storeServiceMock.selectSync).toHaveBeenCalledWith(getActivePortalTabId);
        });

        it('should not send message, when no portal tab id exists', () => {
            const message: Message<null> = {
                destinationController: ControllerType.PORTAL,
                sourceController: ControllerType.OPTIONS,
                type: MessageType.BACKGROUND_PREVIOUS_VIDEO,
                payload: null
            };

            storeServiceMock.selectSync.mockReturnValue(null);

            service.sendMessageToPortalTab(message);

            expect(storeServiceMock.selectSync).toHaveBeenCalledWith(getActivePortalTabId);
        });
    });
});
