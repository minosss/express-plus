import {Badge, BadgeProps} from '@mantine/core';
import * as React from 'react';
import {KuaidiMap} from '../../api/kuaidi-map';

type KindBadgeProps = BadgeProps & {kind: string};

export const KindBadge: React.FC<KindBadgeProps> = ({kind, ...props}) => {
	return <Badge {...props}>{KuaidiMap[kind] ?? kind}</Badge>;
};
