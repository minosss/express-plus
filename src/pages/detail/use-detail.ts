import {useQuery} from '@tanstack/react-query';
import {useAtom} from 'jotai';
import dayjs from 'dayjs';
import {QueryItem} from '../../api/types';
import {MessageKind, Track} from '../../types';
import {fetcher} from '../../utils/fetcher';
import {queryAtom} from './jotai';

export function useDetail() {
	const [query, setQuery] = useAtom(queryAtom);

	const {data, isLoading, error} = useQuery({
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
					createdAt: dayjs(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
			  } as Track));

		await refetch();
	}

	return {
		query,
		needPhone,
		data,
		isLoading,
		error,
		cleanQuery,
		isTracking,
		isLoadingTracking: isFetching,
		toggleTracking,
	};
}
