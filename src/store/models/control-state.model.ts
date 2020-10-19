import Providor from './providor.model';
import Series from './series.model';
import Portal from './portal.model';
import { BrowserWindowStateModel } from './browser-window-state.model';
import SeriesEpisode from './series-episode.model';
import { AsyncInteraction } from './async-interaction.model';


export interface ControlState {
    playedEpisodes: number;
    activePortal?: Portal['key'];
    activeProvidor?: Providor['key'];
    activeEpisode?: SeriesEpisode['key'];
    expandedSeriesOptionsPage?: Series['key'];
    controllerWindowState: { [key: string]: BrowserWindowStateModel };
    asyncInteractions: { [key: string]: AsyncInteraction };
}
