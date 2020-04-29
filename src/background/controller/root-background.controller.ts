import {inject, injectable} from 'inversify';
import {BACKGROUND_TYPES} from '../container/BACKGROUND_TYPES';
import {PortalController} from './portal.controller';
import {VideoController} from './video.controller';
import {TabController} from './tab.controller';
import {browser} from 'webextension-polyfill-ts';
import {MessageService} from '../../shared/services/message.service';
import {SHARED_TYPES} from '../../shared/constants/SHARED_TYPES';
import {StoreService} from '../../shared/services/store.service';
import {ProvidorService} from '../services/providor.service';
import {WindowController} from './window.controller';
import { Message } from '../../browserMessages/messages/message.interface';
import { ControllerType } from '../../browserMessages/enum/controller.type';
import { MessageType } from '../../browserMessages/enum/message-type.enum';
import { StartSeriesMessage } from '../../browserMessages/messages/background.messages';
import { getSeriesByKey } from '../../store/selectors/series.selector';
import { LoopStreamerStatus } from '../../store/enums/loop-streamer-status.enum';
import { setLoopStreamerStatusAction, resetControlStateAction } from 'src/store/reducers/control-state.reducer';

@injectable()
export class RootBackgroundController {


    private isInitialized = false;


    constructor(@inject(BACKGROUND_TYPES.PortalController) private readonly portalController: PortalController,
                @inject(BACKGROUND_TYPES.VideoController) private readonly videoController: VideoController,
                @inject(BACKGROUND_TYPES.TabController) private readonly tabController: TabController,
                @inject(BACKGROUND_TYPES.WindowController) private readonly windowController: WindowController,
                @inject(SHARED_TYPES.MessageService) private readonly messageService: MessageService,
                @inject(SHARED_TYPES.StoreService) private readonly store: StoreService,
                @inject(BACKGROUND_TYPES.ProvidorService) private readonly providorService: ProvidorService) {
    }

    public initialize(): void {
        if (!this.isInitialized) {
            browser.runtime.onMessage.addListener(message => this.handleMessage(message));
        }
    }

    private async handleMessage(message: Message<any>): Promise<void> {
        if (message.destinationController === ControllerType.BACKGROUND) {
            switch (message.type) {
                case MessageType.BACKGROUND_VIDEO_FINISHED: {
                    if (this.tabController.isUserOnVideoTab()) {
                        this.store.stopPlayer();
                        this.videoFinishedHandler();
                    }
                    break;
                }
                case MessageType.BACKGROUND_TOGGLE_FULLSCREEN: {
                    this.windowController.toggleWindowState();
                    break;
                }
                case MessageType.BACKGROUND_WINDOW_RESIZED: {
                    this.windowController.setCurrentWindowState();
                    break;
                }
                case MessageType.BACKGROUND_NEXT_VIDEO: {
                    this.store.stopPlayer();
                    const isNextVideoAvailable = await this.portalController.openNextEpisode();
                    if (!isNextVideoAvailable) {
                        console.error(`${MessageType.BACKGROUND_NEXT_VIDEO}: no next episode available`)
                    }
                    break;
                }
                case MessageType.BACKGROUND_PREVIOUS_VIDEO: {
                    this.store.stopPlayer();
                    const isNextVideoAvailable = await this.portalController.openPreviousEpisode();
                    if (!isNextVideoAvailable) {
                        console.error(`${MessageType.BACKGROUND_PREVIOUS_VIDEO}: no next episode available`)
                    }
                    break;
                }
                case MessageType.BACKGROUND_CONTINUE_SERIES: {
                    this.resetController();
                    this.store.stopPlayer();
                    const {payload} = message as StartSeriesMessage;
                    const series = this.store.selectSync(getSeriesByKey, payload);
                    this.videoController.startVideo(series);
                    break;
                }
                case MessageType.BACKGROUND_START_ACTIVE_SERIES: {
                    this.resetController();
                    this.store.stopPlayer();
                    try {
                        this.portalController.openCurrentEpisode();
                    } catch (e) {
                        this.store.dispatch(setLoopStreamerStatusAction(LoopStreamerStatus.ERROR));
                    }
                    break;
                }
            }
        }
    }

    private async videoFinishedHandler(): Promise<void> {
        await this.portalController.openNextEpisode();
    }


    private resetController(): void {
        this.store.dispatch(resetControlStateAction());
        this.store.stopPlayer();
        this.videoController.reset();
    }
}
