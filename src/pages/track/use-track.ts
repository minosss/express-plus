import type { TrackList } from '../../types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MessageKind } from '../../types';
import { fetcher } from '../../utils/fetcher';

export function useTrack() {
  const queryClient = useQueryClient();
  const { data, isLoading, error, isError } = useQuery({
    queryKey: ['track'],
    queryFn: () => fetcher<TrackList>(MessageKind.Track),
  });

  const { mutate: deleteTrack } = useMutation({
    mutationKey: ['delete_track'],
    mutationFn: (id: string) => fetcher(MessageKind.DeleteTrack, id),
    onSuccess: () => {
      // Invalidate the cache
      queryClient.invalidateQueries(['track']);
    },
  });

  return { data, isLoading, error, isError, deleteTrack };
}
