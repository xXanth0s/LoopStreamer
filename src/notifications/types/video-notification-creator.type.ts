import { NotificationCreator } from './notification-creator.type';
import { SeriesEpisode } from '../../store/models/series-episode.model';
import { Series } from '../../store/models/series.model';

export type VideoNotificationCreator = NotificationCreator<VideoNotificationInput>;

export type VideoNotificationInput = { episodeKey: SeriesEpisode['key'] };
