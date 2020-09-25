import { StateModel } from '../models/state.model';
import Options from '../models/options.model';

export const getOptions = (state: StateModel): Options => state.options;
