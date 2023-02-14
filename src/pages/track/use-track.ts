import {useQuery} from '@tanstack/react-query';
import {MessageKind, TrackList} from '../../types';
import {fetcher} from '../../utils/fetcher';

export function useTrack() {
	const {data, isLoading, error, isError} = useQuery({
		queryKey: ['track'],
		queryFn: () => fetcher<TrackList>(MessageKind.Track),
	});

	return {data, isLoading, error, isError};
}
