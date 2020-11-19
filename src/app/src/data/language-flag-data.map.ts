import { LANGUAGE } from '../../../store/enums/language.enum';
import { LanguageFlag } from '../models/language-flag.model';
import path from 'path';

export const LABGUAGE_FLAG_DATA_MAP: Partial<Record<LANGUAGE, LanguageFlag>> = {
    [LANGUAGE.GERMAN]: {
        language: LANGUAGE.GERMAN,
        title: 'Deutsch',
        src: path.join(process.env.BASE_URL, 'flags', 'germany.svg'),
    },
    [LANGUAGE.ENGLISH_GERMAN_SUB]: {
        language: LANGUAGE.ENGLISH_GERMAN_SUB,
        title: 'Deutsch mit Untertitel',
        src: path.join(process.env.BASE_URL, 'flags', 'germany.svg'),
    },
    [LANGUAGE.ENGLISH]: {
        language: LANGUAGE.ENGLISH,
        title: 'Englisch',
        src: path.join(process.env.BASE_URL, 'flags', 'united-states-of-america.svg'),
    }
};
