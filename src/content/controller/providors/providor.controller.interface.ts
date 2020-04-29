import Series from '../../../store/models/series.model';

export interface IProvidorController {

    startVideo(seriesInfo: Series): boolean;
}
