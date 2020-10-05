import { inject, injectable } from 'inversify';
import { StoreService } from '../../shared/services/store.service';
import { SHARED_TYPES } from '../../shared/constants/SHARED_TYPES';
import { debounceTime, first, mapTo, switchMap, takeUntil, tap } from 'rxjs/operators';
import { MessageService } from '../../shared/services/message.service';
import { fromEvent, Observable, Subject } from 'rxjs';
import { BACKGROUND_TYPES } from '../container/BACKGROUND_TYPES';
import { WindowController } from './window.controller';
import { getVideoTabId } from '../../store/selectors/control-state.selector';
import { createStartVideoProvidorMessage } from '../../browserMessages/messages/providor.messages';
import { setLastWatchedSeriesAction } from '../../store/reducers/lastWatchedSeries.reducer';
import { setActiveVideoWindowIdAction, setVidoeTabIdAction } from '../../store/reducers/control-state.reducer';
import { WindowService } from '../services/window.service';
import SeriesEpisode from '../../store/models/series-episode.model';
import { PROVIDORS } from '../../store/enums/providors.enum';
import { getProvidorForKey } from '../../store/selectors/providors.selector';
import { BrowserWindow } from 'electron';
import Providor from '../../store/models/providor.model';

@injectable()
export class VideoController {

    constructor(
        @inject(SHARED_TYPES.StoreService) private readonly store: StoreService,
        @inject(SHARED_TYPES.MessageService) private readonly messageService: MessageService,
        @inject(BACKGROUND_TYPES.WindowService) private readonly windowService: WindowService,
        @inject(BACKGROUND_TYPES.WindowController) private readonly windowController: WindowController) {
    }

    private readonly takeUntil$ = new Subject();

    public async startVideo(seriesEpisode: SeriesEpisode, providorKey: PROVIDORS): Promise<void> {
        this.reset();
        const providor = this.store.selectSync(getProvidorForKey, providorKey);
        const activeWindow$ = this.openVideoUrl(seriesEpisode.providorLinks[providorKey], providor);

        activeWindow$.pipe(
            takeUntil(this.takeUntil$),
            takeUntil(this.store.playerHasStopped()),
        ).subscribe(async (window) => {
            this.messageService.sendMessageToVideoWindow(createStartVideoProvidorMessage(seriesEpisode, providorKey));
            this.store.dispatch(setLastWatchedSeriesAction(seriesEpisode.seriesKey))
            window.show();
        });
    }

    public reset(): void {
        const providorTabId = this.store.selectSync(getVideoTabId);
        this.windowController.closeTab(providorTabId);
        this.takeUntil$.next();
        this.store.dispatch(setVidoeTabIdAction(null));
    }


    private openVideoUrl(url: string, providor: Providor): Observable<BrowserWindow> {
        const window$ = this.windowController.openLinkForWebsite(providor, url);
        return window$.pipe(
            switchMap((window) => {
                return fromEvent<void>(window.webContents,'dom-ready').pipe(
                    tap(() => this.setNewVideoWindow(window)),
                    debounceTime(1000),
                    first(),
                    mapTo(window),
                );
            } )
        )
    }



    private setNewVideoWindow(newVideoWindow: Electron.BrowserWindow): void {
        this.store.dispatch(setActiveVideoWindowIdAction(newVideoWindow.id))
    }
}
