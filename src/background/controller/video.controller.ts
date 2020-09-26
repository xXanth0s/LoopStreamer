import { inject, injectable } from 'inversify';
import { StoreService } from '../../shared/services/store.service';
import { SHARED_TYPES } from '../../shared/constants/SHARED_TYPES';
import { takeUntil } from 'rxjs/operators';
import { MessageService } from '../../shared/services/message.service';
import { Subject } from 'rxjs';
import { BACKGROUND_TYPES } from '../container/BACKGROUND_TYPES';
import { TabController } from './tab.controller';
import { WindowController } from './window.controller';
import { getVideoTabId } from '../../store/selectors/control-state.selector';
import { createStartVideoProvidorMessage } from '../../browserMessages/messages/providor.messages';
import { setLastWatchedSeriesAction } from '../../store/reducers/lastWatchedSeries.reducer';
import { setVidoeTabIdAction } from '../../store/reducers/control-state.reducer';
import { WindowService } from '../services/window.service';
import SeriesEpisode from '../../store/models/series-episode.model';
import { PROVIDORS } from '../../store/enums/providors.enum';

@injectable()
export class VideoController {

    constructor(
        @inject(SHARED_TYPES.StoreService) private readonly store: StoreService,
        @inject(SHARED_TYPES.MessageService) private readonly messageService: MessageService,
        @inject(BACKGROUND_TYPES.WindowService) private readonly windowService: WindowService,
        @inject(BACKGROUND_TYPES.TabController) private readonly tabController: TabController,
        @inject(BACKGROUND_TYPES.WindowController) private readonly windowController: WindowController) {
    }

    private readonly takeUntil$ = new Subject();

    public async startVideo(seriesEpisode: SeriesEpisode, providor: PROVIDORS): Promise<void> {
        this.reset();
        const activeWindow$ = this.tabController.obenVideoForProvidorAndStartAdblocker(seriesEpisode.providorLinks[providor]);

        activeWindow$.pipe(
            takeUntil(this.takeUntil$),
            takeUntil(this.store.playerHasStopped()),
        ).subscribe(async (window) => {
            // this.windowController.setCurrentWindowState();
            this.messageService.sendMessageToVideoTab(createStartVideoProvidorMessage(seriesEpisode, providor));
            // this.windowController.makeWindowFullscreen();
            this.store.dispatch(setLastWatchedSeriesAction(seriesEpisode.seriesKey))
            this.windowService.getProvidorWindow().show();
        });
    }

    public reset(): void {
        const providorTabId = this.store.selectSync(getVideoTabId);
        this.tabController.closeTab(providorTabId);
        this.takeUntil$.next();
        this.store.dispatch(setVidoeTabIdAction(null));
    }
}
