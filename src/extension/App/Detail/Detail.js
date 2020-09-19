import React, {useState, useEffect} from 'react';
import {Spin, Divider, Timeline, Tag, Descriptions, Result} from 'antd';
import {
	ReloadOutlined,
	StarOutlined,
	StarFilled,
	CheckOutlined,
	EditOutlined,
	CheckCircleFilled,
} from '@ant-design/icons';
import qs from 'query-string';
import useSWR from 'swr';
import dayjs from 'dayjs';
import styled from '@emotion/styled';
import {TypeLabel, StateLabel, IconButton, InnerIconButton} from '../components';
import {fetcher, toFavorite} from '../../utils';
import {STATE_DELIVERED} from '@/shared/utils/kuaidi';

const TimelineItem = styled(Timeline.Item)`
	&:not(:first-child) {
		color: var(--secondary-color);
	}
`;

const isDelivered = (state) => state === STATE_DELIVERED;

const StateCheckedIcon = () => <CheckCircleFilled style={{color: 'var(--success-color)'}} />;

// -
const TimelineList = ({value = [], state}) => (
	<Timeline className='m-4'>
		{value.map((item, index) => (
			<TimelineItem
				key={`message-${item.time}-${index}`}
				dot={index === 0 && isDelivered(state) ? <StateCheckedIcon /> : null}
			>
				<div>
					{dayjs(item.time).fromNow()} {dayjs(item.time).format('HH:mm')}
				</div>
				<div>{item.context}</div>
			</TimelineItem>
		))}
	</Timeline>
);

const Title = styled.div`
	font-size: 18px;
	margin-bottom: 8px;

	> span {
		vertical-align: middle;
	}
`;

export default function Detail({location}) {
	const {type, postId, phone = ''} = qs.parse(location.search);
	const [isSaved, setSaved] = useState(false);
	const {data, isValidating} = useSWR(() => [
		'/kuaidi/query',
		JSON.stringify({type, postId, phone}),
	]);

	useEffect(() => {
		setSaved(data && data.updatedAt && data.message);
	}, [data]);

	const handleToggleChecked = () => {
		if (isSaved) {
			fetcher('/favorites/remove', postId).then(() => {
				setSaved(false);
			});
		} else {
			fetcher('/favorites/add', toFavorite(data)).then((res) => {
				setSaved(true);
			});
		}
	};

	const {data: messages, state, error} = data || {};

	return (
		<Spin spinning={isValidating}>
			<div className='view-detail'>
				<div className='m-4'>
					<Title>
						<span>{postId}</span>
						<IconButton tooltip='刷新' icon={<ReloadOutlined />} />
						<IconButton
							tooltip='收藏'
							icon={<StarOutlined />}
							checkedIcon={<StarFilled />}
							checked={isSaved}
							onClick={handleToggleChecked}
						/>
					</Title>
					<Descriptions size='small' column={2}>
						<Descriptions.Item label='快递'>
							<TypeLabel value={type} />
							<InnerIconButton tooltip='选择快递' icon={<EditOutlined />} />
						</Descriptions.Item>
						<Descriptions.Item label='状态'>
							<StateLabel value={state} />
							{!isDelivered(state) && (
								<InnerIconButton tooltip='确认收货' icon={<CheckOutlined />} />
							)}
						</Descriptions.Item>
						<Descriptions.Item label='标签'>
							<Tag>
								<TypeLabel value={type} />
							</Tag>
						</Descriptions.Item>
					</Descriptions>
				</div>
				<Divider className='m-0' />
				{Array.isArray(messages) && messages.length > 0 && (
					<TimelineList value={messages} state={state} />
				)}
				{error && <Result status='error' title='请求错误' subTitle={error} />}
			</div>
		</Spin>
	);
}
