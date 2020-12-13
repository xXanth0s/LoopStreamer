import { put, select } from 'redux-saga/effects';
import { userChangedLanguageAction } from '../../actions/shared.actions';
import { getSeriesForSeason } from '../../selectors/series.selector';
import { StateModel } from '../../models/state.model';
import { Logger } from '../../../shared/services/logger';
import { updateSeriesSeasonForPortal } from './load-season.saga';
import { generateAsyncInteraction } from '../../store/async-interaction.util';
import { AsyncInteractionType } from '../../enums/async-interaction-type.enum';
import { addAsyncInteractionAction, removeAsyncInteractionAction } from '../../reducers/control-state.reducer';

export function* loadSeriesSeasonForLanguageSaga(action: ReturnType<typeof userChangedLanguageAction>) {
    const state: StateModel = yield select();
    const { seriesSeasonKey, selectedLanguage } = action.payload;
    const series = getSeriesForSeason(yield select(), seriesSeasonKey);

    const portalKey = state.appControlState.activePortal || series.lastUsedPortal;

    if (!portalKey) {
        Logger.error(`[loadSeriesSeasonForLanguageSaga] no valid portal found for series season ${seriesSeasonKey}`);
        return;
    }

    const asyncInteraction = generateAsyncInteraction(AsyncInteractionType.SAGA_LOADING_SEASON, { series, portalKey });
    yield put(addAsyncInteractionAction(asyncInteraction));

    try {
        yield updateSeriesSeasonForPortal({
            language: selectedLanguage,
            seasonKey: seriesSeasonKey,
            portalKey,
        });
    } catch (error) {
        Logger.error('[loadSeriesSeasonForLanguageSaga] error occurred', error);
    } finally {
        yield put(removeAsyncInteractionAction(asyncInteraction.key));
    }
}
