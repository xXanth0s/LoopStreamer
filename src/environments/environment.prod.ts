import { EnvironmentType } from './environment.type';
import { MovieApi } from '../store/enums/movie-api.enum';

export const environment: EnvironmentType = {
    isDev: false,
    openAppDevTools: false,
    openDevTools: false,
    showNewWindows: false,
    autoPlayPreviewVideos: true,
    linkCacheTimeInMinutes: 5,
    videoButtonVisibilityTime: 5000,
    movieApiKeys: {
        [MovieApi.TMDB]: 'daa63aa8627cfd8c6ab8733fa2561153',
    },
};
