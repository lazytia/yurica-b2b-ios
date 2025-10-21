import React from 'react';
import { SafeAreaView } from 'react-native';
import MenuScreen from './screens/MenuScreen';

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <MenuScreen />
    </SafeAreaView>
  );
}
