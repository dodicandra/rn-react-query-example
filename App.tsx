import { SafeAreaView, StyleSheet } from 'react-native';

import { MainApp } from './main';
import { ClientProvider } from './query-client';

export default function App() {
  return (
    <ClientProvider>
      <SafeAreaView style={styles.container}>
        <MainApp />
      </SafeAreaView>
    </ClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
