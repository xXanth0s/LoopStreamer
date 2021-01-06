import { MovieApi } from '../store/enums/movie-api.enum';

export type EnvironmentType = {
    isDev: boolean;
    openAppDevTools: boolean;
    openDevTools: boolean;
    showNewWindows: boolean;
    autoPlayPreviewVideos: boolean;
    linkCacheTimeInMinutes: number;
    videoButtonVisibilityTime: number;
    movieApiKeys: Partial<Record<MovieApi, string>>;
};
