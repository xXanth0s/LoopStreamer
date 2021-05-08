import { VideoNotificationInput } from '../types/video-notification-creator.type';
import { Series } from '../../store/models/series.model';
import { NotificationButton, NotificationModel, NotificationStatus } from '../../store/models/notification.model';
import { setNoStartTimeForSeriesAction } from '../../store/reducers/series.reducer';
import { setCurrentSkipTimeForSeries, SkipTimeType } from '../actions/video-notifiactions.action';
import { StateModel } from '../../store/models/state.model';
import { getSeriesForEpisode } from '../../store/selectors/series.selector';
import { getSeriesEpisodeByKey } from '../../store/selectors/series-episode.selector';
import { Notifications } from '../constants/notifications.enum';
import { createNotification } from '../types/notification-creator.type';
import { SeriesEpisode } from '../../store/models/series-episode.model';
import { TIME_FOR_SET_ENDTIME_POPUP } from '../../constants/popup-config';

const DONT_SKIP_BUTTON_TEXT = 'Nicht überspringen';
const SKIP_CURRENT_TIME_BUTTON_TEXT = 'Jetzt setzen';
const NOTIFICATION_KEY = Notifications.VIDEO_SET_END_TIME;

const defaultNotification: NotificationModel = {
    key: NOTIFICATION_KEY,
    text: '',
    title: '',
    duration: 120,
    closable: true,
    buttons: [],
    status: NotificationStatus.PENDING,
};

export const setEndTimeNotification = createNotification(
    Notifications.VIDEO_SET_END_TIME,
    (state: StateModel, { episodeKey }: VideoNotificationInput): NotificationModel | null => {
        const series = getSeriesForEpisode(state, episodeKey);
        const episode = getSeriesEpisodeByKey(state, episodeKey);

        if (series.isEndTimeConfigured || !isTimeToOpenPopup(episode)) {
            return null;
        }

        const buttons = getButtonConfig(episode);

        return {
            ...defaultNotification,
            buttons,
        };
    },
);

function isTimeToOpenPopup(episode: SeriesEpisode): boolean {
    const timeLeft = episode.duration - episode.timestamp;

    return timeLeft < TIME_FOR_SET_ENDTIME_POPUP;
}

function getButtonConfig(seriesEpisode: SeriesEpisode): NotificationButton[] {
    return [
        getSetSkipCurrentTimeButtonConfig(seriesEpisode.key),
        getDontSkipButtonConfig(seriesEpisode.seriesKey),
    ];
}

function getSetSkipCurrentTimeButtonConfig(episodeKey: SeriesEpisode['key']):
                                            NotificationButton<{ episodeKey: SeriesEpisode['key'] }> {
    const clickAction = setCurrentSkipTimeForSeries({ episodeKey, type: SkipTimeType.StartTime });

    return {
        text: SKIP_CURRENT_TIME_BUTTON_TEXT,
        clickAction,
    };
}

function getDontSkipButtonConfig(seriesKey: Series['key']): NotificationButton<{ key: Series['key'] }> {
    const clickAction = setNoStartTimeForSeriesAction({
        key: seriesKey,
    });

    return {
        text: DONT_SKIP_BUTTON_TEXT,
        clickAction,
    };
}
