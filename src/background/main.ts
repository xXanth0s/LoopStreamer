import {browser} from 'webextension-polyfill-ts';
import {BACKGROUND_TYPES} from './container/BACKGROUND_TYPES';
import {RootBackgroundController} from './controller/root-background.controller';
import {inversifyContainer} from './container/container';
import {wrapStore} from 'webext-redux';
import backgroundStore, { initStore } from '../store/store/background-store';


browser.runtime.onStartup.addListener(initialize);
browser.runtime.onInstalled.addListener(initialize);

async function initialize(): Promise<void> {
   await initStore();
   try {
      wrapStore(backgroundStore);

   } catch (e) {
      console.error('WrapStore throw an exception', e)

   }
   inversifyContainer.get<RootBackgroundController>(BACKGROUND_TYPES.RootController).initialize();
}

initialize();
