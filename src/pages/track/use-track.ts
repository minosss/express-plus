import type { TrackList } from '../../types';
import { useQuery } from '@tanstack/react-query';
import { MessageKind } from '../../types';
import { fetcher } from '../../utils/fetcher';

export function useTrack() {
  const { data, isLoading, error, isError } = useQuery({
    queryKey: ['track'],
    queryFn: () => fetcher<TrackList>(MessageKind.Track),
  });

  return { data, isLoading, error, isError };
}
