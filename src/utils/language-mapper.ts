import { LANGUAGE } from '../store/enums/language.enum';

export function mapLanguage(language: string): LANGUAGE {
    switch (language.toLowerCase().trim()) {
        case 'de':
        case 'de-de':
        case 'de-at':
        case 'deutsch':
        case 'deutschland':
        case 'german':
        case 'germany':
            return LANGUAGE.GERMAN;
        case 'en':
        case 'en-gb':
        case 'en-us':
        case 'english':
        case 'england':
        case 'usa':
        case 'states':
            return LANGUAGE.ENGLISH;
        default:
            return LANGUAGE.NONE;
    }
}
