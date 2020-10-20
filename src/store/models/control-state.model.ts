import Providor from './providor.model';
import Series from './series.model';
import Portal from './portal.model';
import { BrowserWindowStateModel } from './browser-window-state.model';
import SeriesEpisode from './series-episode.model';
import { AsyncInteraction } from './async-interaction.model';
import { WindowType } from '../enums/window-type.enum';


export interface ControlState {
    playedEpisodes: number;
    activePortal?: Portal['key'];
    activeProvidor?: Providor['key'];
    activeEpisode?: SeriesEpisode['key'];
    expandedSeriesOptionsPage?: Series['key'];
    controllerWindowState: Record<WindowType, BrowserWindowStateModel>;
    asyncInteractions: Record<AsyncInteraction['key'], AsyncInteraction>;
}
