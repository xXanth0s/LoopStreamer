import { addClosedNotificationAction } from 'src/store/reducers/control-state.reducer';
import { VideoNotificationInput } from '../types/video-notification-creator.type';
import { SeriesEpisode } from '../../store/models/series-episode.model';
import { NotificationButton, NotificationModel, NotificationStatus } from '../../store/models/notification.model';
import { setNoEndTimeForSeriesAction } from '../../store/reducers/series.reducer';
import { setCurrentSkipTimeForSeries, SkipTimeType } from '../actions/video-notifiactions.action';
import { Notifications } from '../constants/notifications.enum';
import { StateModel } from '../../store/models/state.model';
import { getSeriesForEpisode } from '../../store/selectors/series.selector';
import { getSeriesEpisodeByKey } from '../../store/selectors/series-episode.selector';
import { WindowType } from '../../store/enums/window-type.enum';
import { createNotification } from '../types/notification-creator.type';

const DONT_SKIP_BUTTON_TEXT = 'Nicht überspringen';
const SKIP_CURRENT_TIME_BUTTON_TEXT = 'Jetzt setzen';

const defaultNotification: NotificationModel = {
    key: Notifications.VIDEO_SET_START_TIME,
    title: 'Intro definieren',
    text: 'Die zu überspringenden Zeit setzen',
    closable: true,
    duration: 0,
    buttons: [],
    status: NotificationStatus.PENDING,
    closeAction: addClosedNotificationAction({
        notification: Notifications.VIDEO_SET_START_TIME,
        window: WindowType.VIDEO,
    }),
};

export const SetStartTimeNotificetion = createNotification(
    Notifications.VIDEO_SET_START_TIME,
    (state: StateModel, { episodeKey }: VideoNotificationInput) => {
        const series = getSeriesForEpisode(state, episodeKey);
        const episode = getSeriesEpisodeByKey(state, episodeKey);
        if (series.isStartTimeConfigured || episode.timestamp > 10) {
            return null;
        }

        const buttons = getButtonConfig(episode);

        return {
            ...defaultNotification,
            buttons,
        };
    });

function getButtonConfig(seriesEpisode: SeriesEpisode): NotificationButton[] {
    return [
        getSetSkipCurrentTimeButtonConfig(seriesEpisode.key),
        getDontSkipButtonConfig(seriesEpisode),
    ];
}

function getSetSkipCurrentTimeButtonConfig(episodeKey: SeriesEpisode['key']): NotificationButton {
    const clickAction = setCurrentSkipTimeForSeries({ episodeKey, type: SkipTimeType.StartTime });

    return {
        text: SKIP_CURRENT_TIME_BUTTON_TEXT,
        clickAction,
    };
}

function getDontSkipButtonConfig(seriesEpisode: SeriesEpisode): NotificationButton {
    const clickAction = setNoEndTimeForSeriesAction({
        key: seriesEpisode.key,
    });

    return {
        text: DONT_SKIP_BUTTON_TEXT,
        clickAction,
    };
}
