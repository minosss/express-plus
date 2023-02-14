import {Badge, BadgeProps} from '@mantine/core';
import * as React from 'react';
import {QueryStateMap} from '../../api/state-map';

type StateBadgeProps = BadgeProps & {state: string};

export const StateBadge: React.FC<StateBadgeProps> = ({state, ...props}) => {
	return (
		<Badge color='gray' {...props}>
			{QueryStateMap[state] ?? state}
		</Badge>
	);
};
