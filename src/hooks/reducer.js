import {useState, useCallback} from 'react';

// from redux
function compose(...funcs) {
  if (funcs.length === 0) {
    return arg => arg;
  }

  if (funcs.length === 1) {
    return funcs[0];
  }

  return funcs.reduce((a, b) => (...args) => a(b(...args)));
}

// TODO 总觉得这样处理不太好，不过先这样了
export default function useAsyncReducer(
  reducer,
  initialState,
  middlewares = []
) {
  const [state, setState] = useState(initialState);

  const middlewareAPI = {
    getState: () => state,
    dispatch: async action => {
      const nextState = await reducer(state, action);
      return nextState;
    },
  };

  const dispatch = useCallback(
    async action => {
      const chain = middlewares.map(middleware => middleware(middlewareAPI));
      const nextState = await compose(...chain)(middlewareAPI.dispatch)(action);
      setState(nextState);
    },
    [state]
  );

  return [state, dispatch];
}
