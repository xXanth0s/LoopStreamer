import { createAsyncInteraction } from '../utils/async-interaction.util';
import SeriesEpisode from '../models/series-episode.model';
import Series from '../models/series.model';
import { PORTALS } from '../enums/portals.enum';
import { SeriesSeason } from '../models/series-season.model';
import { AsyncInteractionType } from '../enums/async-interaction-type.enum';

export const continueAutoplayAsyncInteraction = createAsyncInteraction<{ episodeKey: SeriesEpisode['key'] }>(AsyncInteractionType.SAGA_START_CONTINUE_AUTOPLAY);

export const loadingSeriesAsyncInteraction = createAsyncInteraction<{ seriesKey: Series['key'], portalKey: PORTALS }>(AsyncInteractionType.SAGA_LOADING_SERIES);

export const loadingSeasonAsyncInteraction = createAsyncInteraction<{ seasonKey: SeriesSeason['key'] }>(AsyncInteractionType.SAGA_LOADING_SEASON);

export const startEpisodeAsyncInteraction = createAsyncInteraction<{ episodeKey: SeriesEpisode['key'] }>(AsyncInteractionType.SAGA_START_EPISODE);

export const startNextEpisodeAsyncInteraction = createAsyncInteraction<{ episodeKey: SeriesEpisode['key'] }>(AsyncInteractionType.SAGA_START_NEXT_EPISODE);

export const startPreviousEpisodeAsyncInteraction = createAsyncInteraction<{ episodeKey: SeriesEpisode['key'] }>(AsyncInteractionType.SAGA_START_PREVIOUS_EPISODE);

