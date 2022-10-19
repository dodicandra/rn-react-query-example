import React from 'react';

import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Result, usePeople } from './people-service';

interface MainAppProps {}

const MainApp: React.FC<MainAppProps> = () => {
  const { people, fetchNextPage, hasNextPage, isFetchingNextPage, isRefetching, refetch } = usePeople();

  const renderItem: ListRenderItem<Result> = React.useCallback(
    ({ item }) => (
      <View style={styles.textWraper}>
        <Text>{item.name}</Text>
      </View>
    ),
    []
  );
  const keyExtractor = React.useCallback((item: Result) => item.name, []);
  const onMore = React.useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <View style={styles.container}>
      <FlatList
        refreshControl={
          <RefreshControl
            refreshing={isRefetching && !isFetchingNextPage}
            onRefresh={() => refetch({ refetchPage: (_lasPage, index) => index == 0 })}
          />
        }
        data={people}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        onEndReached={onMore}
        ListFooterComponent={
          <React.Fragment>{isFetchingNextPage ? <ActivityIndicator size={30} /> : null}</React.Fragment>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  textWraper: {
    backgroundColor: '#aeaeae',
    marginVertical: 20,
    paddingVertical: 20,
    marginHorizontal: 10,
  },
});

export { MainApp };
