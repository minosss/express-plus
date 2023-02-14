import {Header} from '@mantine/core';
import * as React from 'react';

export const Toolbar: React.FC<React.PropsWithChildren> = ({children}) => {
	return (
		<Header height={64} py='xs' px='md'>
			{children}
		</Header>
	);
};
