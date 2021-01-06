import { EnvironmentType } from './environment.type';
import { MovieApi } from '../store/enums/movie-api.enum';

export const environment: EnvironmentType = {
    isDev: true,
    openAppDevTools: true,
    openDevTools: true,
    showNewWindows: false,
    autoPlayPreviewVideos: true,
    linkCacheTimeInMinutes: 10,
    videoButtonVisibilityTime: 5000,
    movieApiKeys: {
        [MovieApi.TMDB]: 'daa63aa8627cfd8c6ab8733fa2561153',
    },
};
