import * as React from 'react';
import {Box, Text} from '@mantine/core';

export interface EmptyProps {
	iconComponent: React.FC<any>;
	description: string;
}

export const Empty: React.FC<EmptyProps> = (props) => {
	return (
		<Text size='sm' color='dimmed' py={89} align='center'>
			<props.iconComponent fontSize={64} />
			<Box component='p' m={0}>
				{props.description}
			</Box>
		</Text>
	);
};
