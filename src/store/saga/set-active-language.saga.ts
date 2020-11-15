import { SeriesSeason } from '../models/series-season.model';
import { StateModel } from '../models/state.model';
import { put, select } from 'redux-saga/effects';
import { getAvailableLanguagesForSeasonAndActivePortal } from '../selectors/series-season.selector';
import { getSeriesForSeason } from '../selectors/series.selector';
import { setSelectedLanguageAction } from '../reducers/app-control-state.reducer';
import { LANGUAGE } from '../enums/language.enum';

export function* setActiveLanguageForSeasonAndPortal(seasonKey: SeriesSeason['key']) {
    const state: StateModel = yield select();
    const { selectedLanguage } = state.appControlState;
    const { defaultLanguage } = state.options;
    const languages = getAvailableLanguagesForSeasonAndActivePortal(yield select(), seasonKey);
    const series = getSeriesForSeason(yield select(), seasonKey);

    if (languages.length === 0) {
        yield put(setSelectedLanguageAction({ selectedLanguage: LANGUAGE.NONE }));
    }

    if (selectedLanguage === LANGUAGE.NONE) {
        if (languages.find(language => language === series.lastUsedLanguage)) {
            yield put(setSelectedLanguageAction({ selectedLanguage: series.lastUsedLanguage }));
        }

        if (languages.find(language => language === defaultLanguage)) {
            yield put(setSelectedLanguageAction({ selectedLanguage: defaultLanguage }));
        }
    }

    const fallbackLanguage = languages.filter(language => language !== LANGUAGE.NONE)[0] || LANGUAGE.NONE;

    yield put(setSelectedLanguageAction({ selectedLanguage: fallbackLanguage }));
}
