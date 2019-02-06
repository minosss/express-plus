import {combineReducers} from 'redux';
import favorites from './favorites';
import settings from './settings';

const reducer = combineReducers({
  favorites,
  settings
});

export default reducer;
