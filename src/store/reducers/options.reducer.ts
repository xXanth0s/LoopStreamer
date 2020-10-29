import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import Options from '../models/options.model';


const initialOptionsData: Options = {
    episodesToPlay: 0,
    timeTillSetEndtimePopup: 180,
    timeForEndtimeCountdown: 15,
    scipIfNoVideo: false,
};

const updateOptions = function (options: Options): Options {
    return options;
};

export const optionsSlice = createSlice({
    name: 'options',
    initialState: initialOptionsData as Options,
    reducers: {
        updateOptionsAction: (state: Options, action: PayloadAction<Options>) => updateOptions(action.payload)
    }
});

export const {updateOptionsAction} = optionsSlice.actions;





