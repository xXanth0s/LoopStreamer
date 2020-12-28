import SeriesEpisode from '../models/series-episode.model';
import Series from '../models/series.model';
import { END_TIME_BUFFER, TIME_FOR_NEXT_EPISODE_POPUP, TIME_FOR_SET_ENDTIME_POPUP } from '../../constants/popup-config';

export function getProgressForEpisode(seriesEpisode: SeriesEpisode): number {
    if (seriesEpisode.isFinished) {
        return 100;
    }

    const { timestamp, duration } = seriesEpisode;
    if (timestamp) {
        return Math.trunc((timestamp / duration) * 100);
    }

    return 0;
}

export function getSeriesEpisodeTitle(seriesEpisode: SeriesEpisode): string {
    return `S${addLeadingZero(seriesEpisode.season)} E${addLeadingZero(seriesEpisode.episodeNumber)}`;
}

function addLeadingZero(digit: string | number): string {
    const stringValue = `${digit}`;
    if (isNaN(+stringValue)) {
        return stringValue;
    }
    if (stringValue.length === 1) {
        return `0${digit}`;
    }

    return stringValue;
}

export function getPopupEndTimeForSeriesEpisode(series: Series) {
    const { isEndTimeConfigured, scipEndTime } = series;

    if (!isEndTimeConfigured) {
        return TIME_FOR_SET_ENDTIME_POPUP;
    }

    if (scipEndTime < TIME_FOR_NEXT_EPISODE_POPUP - END_TIME_BUFFER) {
        return TIME_FOR_NEXT_EPISODE_POPUP;
    }

    return scipEndTime + TIME_FOR_NEXT_EPISODE_POPUP - END_TIME_BUFFER;
}
