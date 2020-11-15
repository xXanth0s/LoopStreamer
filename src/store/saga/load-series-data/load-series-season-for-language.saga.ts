import { userChangedLanguageAction } from '../../actions/shared.actions';
import { getSeriesForSeason } from '../../selectors/series.selector';
import { select } from 'redux-saga/effects';
import { StateModel } from '../../models/state.model';
import { Logger } from '../../../shared/services/logger';
import { updateSeriesSeasonForPortal } from './load-season.saga';

export function* loadSeriesSeasonForLanguageSaga(action: ReturnType<typeof userChangedLanguageAction>) {
    const state: StateModel = yield select();
    const { seriesSeasonKey, selectedLanguage } = action.payload;
    const series = getSeriesForSeason(yield select(), seriesSeasonKey);

    const portalKey = state.appControlState.activePortal || series.lastUsedPortal;

    if (!portalKey) {
        Logger.error(`[loadSeriesSeasonForLanguageSaga] no valid portal found for series season ${seriesSeasonKey}`);
        return;
    }

    yield updateSeriesSeasonForPortal({
        language: selectedLanguage,
        seasonKey: seriesSeasonKey,
        portalKey,
    });
}

