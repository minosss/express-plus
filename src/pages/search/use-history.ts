import { useQuery } from '@tanstack/react-query';
import { MessageKind, type HistoryList } from '../../types';
import { fetcher } from '../../utils/fetcher';

export function useHistory() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['history'],
    queryFn: () => fetcher<HistoryList>(MessageKind.History),
  });

  return { data, isLoading, isError, error };
}
