import {Transition, TransitionProps} from '@mantine/core';
import * as React from 'react';

export interface TransitionPageProps
	extends Omit<TransitionProps, 'children' | 'duration' | 'transition'> {
	children: React.ReactNode;
}

export const TransitionPage: React.FC<TransitionPageProps> = ({children, ...props}) => {
	return (
		<Transition transition='pop' duration={200} {...props}>
			{(styles) => (
				<div
					style={{
						...styles,
						position: 'absolute',
						top: 0,
						left: 0,
						zIndex: 200,
					}}
				>
					{children}
				</div>
			)}
		</Transition>
	);
};
