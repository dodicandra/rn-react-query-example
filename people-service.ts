import ky, { AfterResponseHook } from 'ky';

import { QueryFunctionContext, useInfiniteQuery } from '@tanstack/react-query';

export const API_HOST = 'https://swapi.dev/api/';

function getErrorMessageHook<T extends Record<string, any>>(errorResponse: T) {
  let message = 'unknown error';

  if (errorResponse?.message) {
    message = errorResponse.message;
  }

  if (typeof errorResponse.statusMessage === 'string') {
    message = errorResponse.statusMessage;
  }

  if (typeof errorResponse.statusMessage === 'object') {
    message = errorResponse.statusMessage?.message ?? 'unknown error message';
  }

  return message;
}

const logerAfterResponseHooks: AfterResponseHook = async (req, _option, res) => {
  const statusIn = [400, 404, ...Array.from(Array(50)).map((_item, index) => 500 + index)];
  const errorResponse = await res.json();
  if (typeof errorResponse === 'string') return;
  const message = getErrorMessageHook(errorResponse);
  if (statusIn.includes(res.status)) {
    console.log('FROM LOGGER ERROR', res.status, message, req.url.replace(API_HOST, ''));
  }
};

const kyInstance = ky.create({
  headers: {
    'cache-control': 'no-cache',
  },
  parseJson(text) {
    try {
      return JSON.parse(text);
    } catch (error) {
      throw new Error('Invalid JSON');
    }
  },
  prefixUrl: API_HOST,
  retry: {
    limit: 2,
    methods: ['get', 'post', 'put', 'delete'],
    statusCodes: [400, 408, 404, 500],
  },
  hooks: {
    afterResponse: [logerAfterResponseHooks],
  },
});

export interface People {
  count: number;
  next: string;
  previous?: string;
  results: Result[];
}

export interface Result {
  name: string;
  height: string;
  mass: string;
  hair_color: string;
  skin_color: string;
  eye_color: string;
  birth_year: string;
  gender: string;
  homeworld: string;
  films: string[];
  species: string[];
  vehicles: string[];
  starships: string[];
  created: string;
  edited: string;
  url: string;
}

export const peopleService = ({ pageParam = 1 }: QueryFunctionContext<[string], number>) => {
  return kyInstance.get(`people?page=${pageParam}`).json<People>();
};

export function usePeople() {
  const { data, fetchNextPage, isFetchingNextPage, isFetching, isLoading, hasNextPage, isRefetching, refetch } =
    useInfiniteQuery(['people-1'], peopleService, {
      getNextPageParam: (lastPage, allPage) => {
        if (allPage.length < Math.ceil(lastPage.count / 10)) {
          return allPage.length + 1;
        }
        return undefined;
      },
      onError(err) {
        console.log(err);
      },
      onSettled(data, error) {
        if (data) {
          console.log(data.pageParams);
        }
      },
      cacheTime: Infinity,
      staleTime: 1000 * 60 * 60 * 1,
    });

  const people = data?.pages.reduce<Result[]>((acc, item) => [...acc, ...item.results], []);
  return { people, fetchNextPage, isFetchingNextPage, isFetching, isLoading, hasNextPage, isRefetching, refetch };
}
