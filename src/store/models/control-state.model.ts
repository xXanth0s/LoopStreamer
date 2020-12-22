import Providor from './providor.model';
import { BrowserWindowStateModel } from './browser-window-state.model';
import SeriesEpisode from './series-episode.model';
import { AsyncInteraction } from './async-interaction.model';
import { WindowType } from '../enums/window-type.enum';

export interface ControlState {
    playedEpisodes: number;
    activeProvidor?: Providor['key'];
    activeEpisode?: SeriesEpisode['key'];
    asyncInteractions: Record<AsyncInteraction<any>['key'], AsyncInteraction<any>>;
    controllerWindowState: Partial<Record<WindowType, BrowserWindowStateModel>>;
    isVideoPictureInPicture?: boolean;
}
