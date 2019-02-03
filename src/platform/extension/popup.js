import React from 'react';
import {render} from 'react-dom';
import * as serviceWorker from '../../service-worker';
import App from '../../app';
import StorageService from '../../services/storage-service';
import './style.less';

// Storage middlware, save state after updated.
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
