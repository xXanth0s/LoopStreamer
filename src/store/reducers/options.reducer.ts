import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import Options from '../models/options.model';


const initialOptionsData: Options = {
    episodesToPlay: 0,
    makeFullscreen: false,
    showNotifications: false,
    timeTillSetEndtimePopup: 180,
    timeForEntimeCountdown: 15,
    prepareVideo: false,
    allowUserShare: false,
    scipIfNoVideo: false,
    portalAdBlock: false
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





