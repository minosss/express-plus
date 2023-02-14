import {ActionIcon, Badge, Box, Group, Stack, Text, Tooltip} from '@mantine/core';
import {SearchIcon, TrashIcon} from 'lucide-react';
import dayjs from 'dayjs';
import * as React from 'react';
import {Track} from '../../types';
import {KindBadge, StateBadge} from '../../components/index';

export interface TrackItemProps {
	track: Track;
	onQuery?: () => void;
	onDelete?: () => void;
}

export const TrackItem: React.FC<TrackItemProps> = (props) => {
	const {track, onQuery, onDelete} = props;

	return (
		<Box
			px='md'
			py='xs'
			sx={(theme) => ({
				position: 'relative',
				backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : '#fff',
				borderBottom: `1px solid ${theme.colors.gray[2]}`,
				'[data-extra]': {
					position: 'absolute',
					right: 16,
					top: 8,
					display: 'none',
				},
				'&:hover': {
					backgroundColor: theme.colors.gray[0],
					'[data-extra]': {
						display: 'flex',
					},
				},
			})}
		>
			<Stack spacing={4}>
				<Box>
					<Text size='sm' lineClamp={1} title={track.id}>
						{track.id}
					</Text>
					<Group spacing={4} data-extra noWrap>
						<Tooltip label={`查询`}>
							<ActionIcon size='sm' onClick={onQuery}>
								<SearchIcon fontSize={12} />
							</ActionIcon>
						</Tooltip>
						<Tooltip label={`删除`}>
							<ActionIcon size='sm' color='red' onClick={onDelete}>
								<TrashIcon fontSize={12} />
							</ActionIcon>
						</Tooltip>
					</Group>
				</Box>
				<Text size='xs' color='dimmed' lineClamp={1} title={track.context}>
					{dayjs(track.updatedAt).fromNow()} - {track.context ?? '未有消息'}
				</Text>
				<Group spacing='xs'>
					<KindBadge kind={track.kind} />
					<StateBadge state={track.state} />
				</Group>
			</Stack>
		</Box>
	);
};
