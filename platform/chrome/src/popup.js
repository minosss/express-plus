import React from 'react';
import {render} from 'react-dom';
import * as serviceWorker from '@/serviceWorker';
import App from '@/app';
import StorageService from '@/services/StorageService';
import './style.less';

// storage middlware, save state after updated.
const storageMiddleware = () => next => async action => {
  console.log('storage action <', action);
  const nextState = await next(action);
  StorageService.save(nextState);
  return nextState;
};

async function launch() {
  const savedData = await StorageService.get();
  render(
    <App initialState={savedData} platformMiddlewares={[storageMiddleware]} />,
    document.querySelector('#root')
  );
}

launch();

serviceWorker.unregister();
