import {produce} from 'immer';
import {RECEIVE_DATA, UPDATE_SETTINGS} from '../actions';

export default function settings(state = {}, action) {
  return produce(state, draft => {
    switch (action.type) {
      case UPDATE_SETTINGS:
        Object.keys(action.settings).forEach(key => {
          draft[key] = action.settings[key];
        });

        return;
      case RECEIVE_DATA:
        return action.settings;
      default:
    }
  });
}
