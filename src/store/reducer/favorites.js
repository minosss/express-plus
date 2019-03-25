import {produce} from 'immer';
import {
  RECEIVE_DATA,
  CREATE_FAVORITE,
  UPDATE_FAVORITE,
  UPDATE_TAGS,
  DELETE_FAVORITE
} from '../actions';

export default function favorites(state = [], action) {
  return produce(state, draft => {
    const index = draft.findIndex(item => item.postId === action.postId);
    const isExist = index !== -1;
    switch (action.type) {
      case CREATE_FAVORITE:
        if (!isExist) {
          draft.push({...action.favorite});
        }

        return;
      case UPDATE_TAGS:
        if (isExist) {
          draft[index].tags = action.tags;
        }

        return;
      case UPDATE_FAVORITE:
        if (isExist) {
          draft[index] = action.favorite;
        }

        return;
      case DELETE_FAVORITE:
        draft.splice(index, 1);
        return;
      case RECEIVE_DATA:
        return action.favorites;
      default:
    }
  });
}
