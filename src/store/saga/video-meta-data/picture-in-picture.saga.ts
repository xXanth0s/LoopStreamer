import { select } from 'redux-saga/effects';
import { getWindowService } from '../../../background/container/container.utils';
import { isVideoPictureInPicture } from '../../selectors/app-control-state.selector';

export function* pictureInPictureSaga() {
    const isPictureInPicture = isVideoPictureInPicture(yield select());
    debugger;
    if (!isPictureInPicture) {
        const windowService = getWindowService();
        windowService.moveVideoWindowToTop();
    }
}
