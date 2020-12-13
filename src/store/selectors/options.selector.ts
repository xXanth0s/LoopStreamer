import { StateModel } from '../models/state.model';
import Options from '../models/options.model';
import { LANGUAGE } from '../enums/language.enum';

export const getOptions = (state: StateModel): Options => state.options;


export const getDefaultLanguage = (state: StateModel): LANGUAGE => state.options.defaultLanguage;
