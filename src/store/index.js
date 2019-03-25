import thunk from 'redux-thunk';
import {applyMiddleware, createStore} from 'redux';
import reducer from './reducer';

const api = {};

const logger = store => next => action => {
  console.log('dispatching', action);
  const result = next(action);
  console.log('next state', store.getState());
  return result;
};

const store = createStore(
  reducer,
  applyMiddleware(logger, thunk.withExtraArgument({api}))
);

export default store;
