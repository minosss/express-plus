import {Skeleton, Stack} from '@mantine/core';

export const Loader = () => (
	<Stack px='md' py='xs' spacing='xs'>
		<Skeleton h={64} />
		<Skeleton h={64} />
		<Skeleton h={64} />
		<Skeleton h={64} />
		<Skeleton h={64} />
	</Stack>
);
