import {Text, Box, Group} from '@mantine/core';
import * as React from 'react';

export const SettingItem: React.FC<{
	title: string;
	description?: string;
	rightSection?: React.ReactNode;
}> = ({rightSection, title, description}) => {
	return (
		<Box
			px='md'
			py='xs'
			sx={(theme) => ({
				position: 'relative',
				backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : '#fff',
				borderBottom: `1px solid ${theme.colors.gray[2]}`,
			})}
		>
			<Group position='apart' align='center' noWrap>
				<Box>
					<Text size='sm'>{title}</Text>
					{description && (
						<Text size='xs' color='dimmed'>
							{description}
						</Text>
					)}
				</Box>
				{rightSection}
			</Group>
		</Box>
	);
};
