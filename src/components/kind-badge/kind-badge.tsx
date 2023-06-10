import type { BadgeProps } from '@mantine/core';
import { Badge } from '@mantine/core';
import * as React from 'react';
import { KuaidiMap } from '../../api';

type KindBadgeProps = BadgeProps & { kind: string };

export const KindBadge: React.FC<KindBadgeProps> = ({ kind, ...props }) => {
  return <Badge {...props}>{KuaidiMap.get(kind) ?? kind}</Badge>;
};
