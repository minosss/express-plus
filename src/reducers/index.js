import {produce} from 'immer';
import favorites from './favorites';
import settings from './settings';

// From redux
function combineReducers(reducers) {
  const reducersKeys = Object.keys(reducers);
  return (state = {}, action) => {
    return produce(state, draft => {
      for (const key of reducersKeys) {
        const reducer = reducers[key];
        const preStateForKey = state[key];
        const nextStateForKey = reducer(preStateForKey, action);
        draft[key] = nextStateForKey;
      }
    });
  };
}

export default combineReducers({
  favorites,
  settings
});
