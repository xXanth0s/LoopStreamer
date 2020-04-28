import Options from './options.model';
import Portal from './portal.model';
import Providor from './providor.model';
import Series from './series.model';
import {ControlState} from './control-state.model';

export interface StateModel {
    controlState: ControlState;
    options: Options;
    portals: {[key: string]: Portal};
    providors: {[key: string]: Providor};
    series: {[key: string]: Series};
    lastWatchedSeries: Series['key'];
}
