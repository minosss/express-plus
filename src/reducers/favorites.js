import produce from 'immer';

export const CREATE_FAVORITE = 'CREATE_FAVORITE';
export const DELETE_FAVORITE = 'DELETE_FAVORITE';
export const UPDATE_FAVORITE = 'UPDATE_FAVORITE';
export const REQUEST_FAVORITES = 'REQUEST_FAVORITES';
export const UPDATE_TAGS = 'UPDATE_TAGS';

export default function favorites(state = [], action) {
  return produce(state, draft => {
    const index = draft.findIndex(
      item => item.postId === action.payload.postId
    );
    const isExist = index !== -1;
    switch (action.type) {
      case CREATE_FAVORITE:
        if (!isExist) {
          draft.push(action.payload);
        }
        break;
      case UPDATE_TAGS:
        if (isExist) {
          draft[index].tags = action.payload.tags;
        }
        break;
      case UPDATE_FAVORITE:
        if (isExist) {
          draft[index] = action.payload;
        }
        break;
      case DELETE_FAVORITE:
        draft.splice(index, 1);
        break;
      default:
    }
  });
}
