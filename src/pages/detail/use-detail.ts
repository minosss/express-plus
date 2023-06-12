import type { QueryItem } from '../../api/types';
import type { Track } from '../../types';
import { useQuery } from '@tanstack/react-query';
import { useAtom } from 'jotai';
import { useEffect } from 'react';
import { MessageKind } from '../../types';
import { fetcher } from '../../utils/fetcher';
import { now } from '../../utils/helper';
import { queryAtom } from './store';

export function useDetail() {
  const [query, setQuery] = useAtom(queryAtom);

  const { data, isLoading, error, refetch: refetchDetail } = useQuery({
    queryKey: ['query', query],
    queryFn: async () => await fetcher<QueryItem>(MessageKind.Query, query),
    enabled: query != null,
  });

  function cleanQuery() {
    setQuery(null);
  }

  const needPhone = query?.kind === 'sf';

  const {
    data: saved,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['tracking', query?.id],
    queryFn: async () => await fetcher<Track>(MessageKind.GetTrack, query?.id),
    enabled: query?.id != null,
  });

  const isTracking = saved != null;

  async function toggleTracking() {
    if (data == null) throw new Error('Can not tracking without data');

    await (isTracking
      ? fetcher(MessageKind.DeleteTrack, query?.id)
      : fetcher(MessageKind.PutTrack, {
        ...query,
        state: data.state,
        context: data.data[0]?.context,
        updatedAt: data.updatedAt,
        createdAt: now(),
      } as Track));

    await refetch();
  }

  useEffect(() => {
    if (isTracking && data != null && data.updatedAt > saved.updatedAt) {
      // 不想放在 offscreen 上，只发送更新
      fetcher(MessageKind.PutTrack, {
        ...saved,
        context: data.data[0]?.context,
        updatedAt: data.updatedAt,
      } as Track);
    }
  }, [data, isTracking, saved]);

  // saved

  return {
    query,
    needPhone,
    data,
    isLoading,
    refetchDetail,
    error,
    cleanQuery,
    isTracking,
    isLoadingTracking: isFetching,
    toggleTracking,
  };
}
