import { SeriesService } from '../services/series.service';
import { inversifyContainer } from './container';
import { BACKGROUND_TYPES } from './BACKGROUND_TYPES';

export function getSeriesService(): SeriesService {
    return inversifyContainer.get<SeriesService>(BACKGROUND_TYPES.SeriesService);
}
