import {useState, useEffect, useRef} from 'react';

const useGeolocation = ({watch = false, timeout = 10000}) => {
  const [state, setState] = useState({
    loading: true,
    latitude: null,
    longitude: null,
    timestamp: Date.now()
  });
  const mounted = useRef(true);

  const onSuccess = ({coords, timestamp}) => {
    if (mounted.current) {
      setState({
        loading: false,
        latitude: coords.latitude,
        longitude: coords.longitude,
        timestamp
      });
    }
  };

  const onError = error => {
    if (mounted.current) {
      setState(state => ({...state, loading: false, error}));
    }
  };

  useEffect(() => {
    mounted.current = true;
    let watchId;

    navigator.geolocation.getCurrentPosition(onSuccess, onError, {timeout});
    if (watch) {
      watchId = navigator.geolocation.watchPosition(onSuccess, onError, {timeout});
    }

    return () => {
      mounted.current = false;
      navigator.geolocation.clearWatch(watchId);
    };
  }, [watch, timeout]);

  return state;
};

export default useGeolocation;
