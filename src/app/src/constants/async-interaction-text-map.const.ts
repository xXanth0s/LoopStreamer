import { AsyncInteractionType } from '../../../store/enums/async-interaction-type.enum';

export const ASYNC_INTERACTION_TEXT_MAP: Record<AsyncInteractionType, string> = {
    [AsyncInteractionType.SAGA_LOADING_SERIES_SEARCH]: 'Suche wird aktualisiert',
    [AsyncInteractionType.SAGA_LOADING_SERIES_INFORMATION_FROM_PORTAL]: 'Daten werden aktualisiert',
    [AsyncInteractionType.SAGA_LOADING_SEASON]: 'Daten werden aktualisiert',
    [AsyncInteractionType.SAGA_LOADING_SERIES_INFORMATION_FROM_API]: 'Daten werden aktualisiert',
    [AsyncInteractionType.SAGA_START_EPISODE]: 'Episode wird gestartet',
    [AsyncInteractionType.SAGA_START_NEXT_EPISODE]: 'Episode wird gestartet',
    [AsyncInteractionType.SAGA_START_PREVIOUS_EPISODE]: 'Episode wird gestartet',
    [AsyncInteractionType.SAGA_START_CONTINUE_AUTOPLAY]: 'Episode wird gestartet',
};
