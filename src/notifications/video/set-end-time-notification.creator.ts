import { VideoNotificationCreator, VideoNotificationInput } from '../types/video-notification-creator.type';
import { Series } from '../../store/models/series.model';
import { SeriesEpisode } from '../../store/models/series-episode.model';
import { NotificationButton, NotificationModel, NotificationStatus } from '../../store/models/notification.model';
import { setNoStartTimeForSeriesAction } from '../../store/reducers/series.reducer';
import { setCurrentSkipTimeForSeries } from '../actions/video-notifiactions.action';
import { StateModel } from '../../store/models/state.model';
import { getSeriesForEpisode } from '../../store/selectors/series.selector';
import { getSeriesEpisodeByKey } from '../../store/selectors/series-episode.selector';
import { Notifications } from '../constants/notifications.enum';

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

const create = (state: StateModel, { episodeKey }: VideoNotificationInput) => {
    const series = getSeriesForEpisode(state, episodeKey);
    const episode = getSeriesEpisodeByKey(state, episodeKey);
    const status = getStatus(state, episode, series);
    const buttons = getButtonConfig(series);

    return {
        ...defaultNotification,
        buttons,
        status,
    };
};

function getStatus(state: StateModel, episode: SeriesEpisode, series: Series): NotificationStatus {
    const isTimeConfiguredOrEpisodeStarted = series.isStartTimeConfigured || Boolean(episode.timestamp);
    return isTimeConfiguredOrEpisodeStarted ? NotificationStatus.PENDING : NotificationStatus.OPEN;
}

function getButtonConfig(series: Series): NotificationButton[] {
    return [
        getSetSkipCurrentTimeButtonConfig(series),
        getDontSkipButtonConfig(series),
    ];
}

function getSetSkipCurrentTimeButtonConfig(series: Series): NotificationButton<{ seriesKey: Series['key'] }> {
    const clickAction = setCurrentSkipTimeForSeries({ seriesKey: series.key });

    return {
        text: SKIP_CURRENT_TIME_BUTTON_TEXT,
        clickAction,
    };
}

function getDontSkipButtonConfig(series: Series): NotificationButton<{ key: Series['key'] }> {
    const clickAction = setNoStartTimeForSeriesAction({
        key: series.key,
    });

    return {
        text: DONT_SKIP_BUTTON_TEXT,
        clickAction,
    };
}

export const setEndTimeNotificationCreator: VideoNotificationCreator = {
    create,
    type: Notifications.VIDEO_SET_END_TIME,
};
