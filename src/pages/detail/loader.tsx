import {Box, Divider, SimpleGrid, Skeleton, Stack} from '@mantine/core';

export const Loader = () => {
	return (
		<>
			<SimpleGrid cols={2} px='md' py='xs'>
				<Box>
					<Skeleton w={64} h={20} />
					<Skeleton w={128} h={20} mt={4} />
				</Box>
				<Box>
					<Skeleton w={64} h={20} />
					<Skeleton w={128} h={20} mt={4} />
				</Box>
				<Box>
					<Skeleton w={64} h={20} />
					<Skeleton w={128} h={20} mt={4} />
				</Box>
				<Box>
					<Skeleton w={64} h={20} />
					<Skeleton w={128} h={20} mt={4} />
				</Box>
				<Skeleton h={40} style={{gridColumnStart: 1, gridColumnEnd: 3}} />
			</SimpleGrid>
			<Divider />
			<Stack px='md' py='xs' spacing='xs'>
				<Skeleton h={64} />
				<Skeleton h={64} />
				<Skeleton h={64} />
				<Skeleton h={64} />
			</Stack>
		</>
	);
};
