import { useEffect } from 'react';
import { AppState } from 'react-native';
import { useDispatch } from 'react-redux';
import { syncOfflineExpenses } from '../store/slices/expenseSlice';

export default function useNetworkSync() {
  const dispatch = useDispatch();

  useEffect(() => {
    let unsubNetInfo = null;
    let appStateHandler = null;
    try {
      const NetInfo = require('@react-native-community/netinfo').default;
      unsubNetInfo = NetInfo.addEventListener((state) => {
        if (state?.isConnected) {
          console.log('[useNetworkSync] Online - triggering sync');
          dispatch(syncOfflineExpenses());
        }
      });
    } catch (e) {
      appStateHandler = (nextAppState) => {
        if (nextAppState === 'active') {
          console.log('[useNetworkSync] App active - attempting sync');
          dispatch(syncOfflineExpenses());
        }
      };
      AppState.addEventListener('change', appStateHandler);
    }

    dispatch(syncOfflineExpenses());

    return () => {
      try {
        if (unsubNetInfo) unsubNetInfo();
      } catch (err) {
      }
      if (appStateHandler) {
        AppState.removeEventListener('change', appStateHandler);
      }
    };
  }, [dispatch]);
}

