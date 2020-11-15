import { SeriesSeason } from '../models/series-season.model';
import { StateModel } from '../models/state.model';
import { put, select } from 'redux-saga/effects';
import { getAvailableLanguagesForSeasonAndActivePortal } from '../selectors/series-season.selector';
import { getSeriesForSeason } from '../selectors/series.selector';
import { setSelectedLanguageAction } from '../reducers/app-control-state.reducer';

export function* setActiveLanguageForSeasonAndPortal(seasonKey: SeriesSeason['key']) {
    const state: StateModel = yield select();
    const { selectedLanguage } = state.appControlState;
    const { defaultLanguage } = state.options;
    const languages = getAvailableLanguagesForSeasonAndActivePortal(yield select(), seasonKey);
    const series = getSeriesForSeason(yield select(), seasonKey);

    if (languages.length === 0) {
        return;
    }

    if (languages.find(language => language === selectedLanguage)) {
        return;
    }

    if (languages.find(language => language === series.lastUsedLanguage)) {
        yield put(setSelectedLanguageAction({ selectedLanguage: series.lastUsedLanguage }));
    }

    if (languages.find(language => language === defaultLanguage)) {
        yield put(setSelectedLanguageAction({ selectedLanguage: defaultLanguage }));
    }

    yield put(setSelectedLanguageAction({ selectedLanguage: languages[0] }));
}
