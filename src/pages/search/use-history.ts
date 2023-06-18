import { useQuery } from '@tanstack/react-query';
import { MessageKind, type QueryHistoryList } from '../../types';
import { fetcher } from '../../utils/fetcher';

export function useHistory() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['history'],
    queryFn: () => fetcher<QueryHistoryList>(MessageKind.History),
  });

  return { data, isLoading, isError, error };
}
