import { createAsyncInteraction } from '../utils/async-interaction.util';
import { SeriesEpisode } from '../models/series-episode.model';
import { Series } from '../models/series.model';
import { PORTALS } from '../enums/portals.enum';
import { SeriesSeason } from '../models/series-season.model';
import { AsyncInteractionType } from '../enums/async-interaction-type.enum';

/* eslint-disable max-len */

export const continueAutoplayAsyncInteraction = createAsyncInteraction<{ episodeKey: SeriesEpisode['key'] }>(AsyncInteractionType.SAGA_START_CONTINUE_AUTOPLAY);

export const loadingSeriesSearchResult = createAsyncInteraction<{ searchText: string }>(AsyncInteractionType.SAGA_LOADING_SERIES_SEARCH);

export const loadingDetailedSeriesInformation = createAsyncInteraction<{ seriesKey: string }>(AsyncInteractionType.SAGA_LOADING_SERIES_INFORMATION_FROM_API);

export const loadingSeriesAsyncInteraction = createAsyncInteraction<{ seriesKey: Series['key']; portalKey: PORTALS }>(AsyncInteractionType.SAGA_LOADING_SERIES_INFORMATION_FROM_PORTAL);

export const loadingSeasonAsyncInteraction = createAsyncInteraction<{ seasonKey: SeriesSeason['key'] }>(AsyncInteractionType.SAGA_LOADING_SEASON);

export const loadingSeasonForcedAsyncInteraction = createAsyncInteraction<{ seasonKey: SeriesSeason['key'] }>(AsyncInteractionType.SAGA_LOADING_SEASON_FORCED);

export const startEpisodeAsyncInteraction = createAsyncInteraction<{ episodeKey: SeriesEpisode['key'] }>(AsyncInteractionType.SAGA_START_EPISODE);

export const startNextEpisodeAsyncInteraction = createAsyncInteraction<{ episodeKey: SeriesEpisode['key'] }>(AsyncInteractionType.SAGA_START_NEXT_EPISODE);

export const startPreviousEpisodeAsyncInteraction = createAsyncInteraction<{ episodeKey: SeriesEpisode['key'] }>(AsyncInteractionType.SAGA_START_PREVIOUS_EPISODE);

/* eslint-enable max-len */
