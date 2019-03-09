import {useCallback, useState, useEffect} from 'react';

// from https://github.com/streamich/react-use
const useAsync = (fn, args) => {
  const [state, set] = useState({loading: true});
  const memoized = useCallback(fn, args);

  useEffect(() => {
    let mounted = true;
    set({
      loading: true
    });
    const promise = memoized();

    promise
      // eslint-disable-next-line promise/prefer-await-to-then
      .then(value => {
        if (mounted) {
          set({
            loading: false,
            value
          });
        }
      }, error => {
        if (mounted) {
          set({
            loading: false,
            error
          });
        }
      });

    return () => {
      mounted = false;
    };
  }, [memoized]);

  return state;
};

export default useAsync;
