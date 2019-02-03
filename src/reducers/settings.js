import {produce} from 'immer';

export const UPDATE_SETTINGS = 'UPDATE_SETTINGS';

export default function settings(state = {}, action) {
  return produce(state, draft => {
    switch (action.type) {
      case UPDATE_SETTINGS:
        Object.keys(action.payload).forEach(key => {
          draft[key] = action.payload[key];
        });
        break;
      default:
    }
  });
}
