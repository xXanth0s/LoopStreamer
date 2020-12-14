import { LANGUAGE } from '../enums/language.enum';

export interface Genre {
    key: string,
    translations: Partial<Record<LANGUAGE, string>>
}
