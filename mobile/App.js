import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { store } from './src/store';
import AppNavigator from './src/navigation/AppNavigator';
import useNetworkSync from './src/hooks/useNetworkSync';

export default function App() {
  return (
    <Provider store={store}>
      <Root />
      <StatusBar style="auto" />
    </Provider>
  );
}

function Root() {
  useNetworkSync();
  return <AppNavigator />;
}

