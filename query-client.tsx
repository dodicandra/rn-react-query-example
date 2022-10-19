import React from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { HTTPError } from 'ky';

import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';

import { API_HOST } from './people-service';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: 1000 * 60 * 60 * 24, // 24 hours
      retry: false,
    },
  },
  logger: {
    error: (arg) => {
      if (arg instanceof HTTPError) {
        console.log('FROM RQ LOGGER ERROR', arg.response.status, arg.message, arg.request.url.replace(API_HOST, ''));
      }
    },
    log: console.log,
    warn: console.warn,
  },
});

const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
});

function ClientProvider({ children }: { children: React.ReactNode }) {
  return (
    <PersistQueryClientProvider client={queryClient} persistOptions={{ persister: asyncStoragePersister }}>
      {children}
    </PersistQueryClientProvider>
  );
}

export { ClientProvider };
