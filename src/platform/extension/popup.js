import React from 'react';
import {render} from 'react-dom';
import {StoreContext} from 'redux-react-hook';
import * as serviceWorker from '../../serviceWorker';
import App from '../../app';
import withSentry from '../../sentry';
import store from '../../store';
import {RECEIVE_DATA} from '../../store/actions';
import {InternalMessage, internalMessageTypes} from '../../model/message-model';
import './style.less';

async function launch() {
  // 向后台请求数据
  const {data: preData} = await InternalMessage.create(internalMessageTypes.LOAD).send();
  store.dispatch({type: RECEIVE_DATA, ...preData});
  // 当store更新时，发送到后台保存
  store.subscribe(async () => {
    const data = store.getState();
    await InternalMessage.create(internalMessageTypes.UPDATE, data).send();
  });

  const Root = withSentry(() => (
    <StoreContext.Provider value={store}>
      <App />
    </StoreContext.Provider>
  ));

  render(
    <Root />,
    document.querySelector('#root')
  );
}

launch();

serviceWorker.unregister();
