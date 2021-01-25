import { VideoNotificationCreator, VideoNotificationInput } from '../types/video-notification-creator.type';
import { Series } from '../../store/models/series.model';
import { SeriesEpisode } from '../../store/models/series-episode.model';
import { NotificationButton, NotificationModel, NotificationStatus } from '../../store/models/notification.model';
import { setNoStartTimeForSeriesAction } from '../../store/reducers/series.reducer';
import { setCurrentSkipTimeForSeries } from '../actions/video-notifiactions.action';

const DONT_SKIP_BUTTON_TEXT = 'Nicht überspringen';
const SKIP_CURRENT_TIME_BUTTON_TEXT = 'Jetzt setzen';

const defaultNotification: NotificationModel = {
    title: 'Intro definieren',
    text: 'Die zu überspringenden Zeit setzen',
    closable: true,
    programmaticallyClosable: false,
    duration: 0,
    buttons: [],
    status: NotificationStatus.PENDING,
};

export const setStartTimeNotificationCreator: VideoNotificationCreator = (seriesData: VideoNotificationInput) => {
    const { series, episode } = seriesData;
    if (isStartimeAlreadySet(series, episode)) {
        return null;
    }

    const buttons = getButtonConfig(series);

    return {
        ...defaultNotification,
        buttons,
    };
};

function getStatus(series: Series, episode: SeriesEpisode): NotificationStatus {
    const isStartTimeSet = series.isStartTimeConfigured || Boolean(episode.timestamp);
    return isStartTimeSet ? NotificationStatus.PENDING : NotificationStatus.OPEN;
}

function getButtonConfig(series: Series): NotificationButton[] {
    return [
        getSetSkipCurrentTimeButtonConfig(series),
        getDontSkipButtonConfig(series),
    ];
}

function getSetSkipCurrentTimeButtonConfig(series: Series): NotificationButton {
    const clickAction = setCurrentSkipTimeForSeries({ seriesKey: series.key });

    return {
        text: SKIP_CURRENT_TIME_BUTTON_TEXT,
        clickAction,
    };
}

function getDontSkipButtonConfig(series: Series): NotificationButton {
    const clickAction = setNoStartTimeForSeriesAction({
        key: series.key,
    });

    return {
        text: DONT_SKIP_BUTTON_TEXT,
        clickAction,
    };
}
