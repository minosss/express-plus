/* @jsx jsx */
import {Tag, List, Popconfirm} from 'antd';
import {
	DeleteOutlined,
	SearchOutlined,
	PushpinOutlined,
	PushpinFilled,
	ClockCircleOutlined,
	CheckCircleFilled,
} from '@ant-design/icons';
import {css, jsx} from '@emotion/react';
import useSWR from 'swr';
import dayjs from 'dayjs';
import {fetcher} from '../../utils';
import {IconButton, TypeLabel} from '../components';
import {API_URLS} from 'shared/constants';
import {STATE_DELIVERED} from 'shared/utils/kuaidi';
import {RouteComponentProps} from 'react-router-dom';

const TagList = ({type, value = []}: any) => (
	<div>
		<Tag>
			<TypeLabel value={type} />
		</Tag>
		{value.map((item: any) => (
			<Tag key={`tag-${item}`}>{item}</Tag>
		))}
	</div>
);

const LatestMessage = ({time, message}: any) => {
	if (!time || !message) {
		return <div>未知</div>;
	}

	return (
		<div className='text-ellipsis-lines' title={message}>
			{dayjs(time).fromNow()} <ClockCircleOutlined /> {message}
		</div>
	);
};

const listItemHover = css`
	transition: background 0.3s;
	position: relative;

	&:hover {
		background: var(--list-item-hover-color);

		.ant-list-item-action {
			opacity: 1;
		}
	}

	.ant-list-item-action {
		opacity: 0;
		background: transparent;
		position: absolute;
		top: 3px;
		right: 13px;
	}

	.ant-list-item-action > li:last-child {
		padding-right: 0;
	}
`;

const Favorites: React.FC<RouteComponentProps> = ({history}) => {
	const {data, isValidating, mutate} = useSWR(API_URLS.FAVORITES);

	return (
		<List
			loading={isValidating}
			className='favorites-list'
			dataSource={data}
			renderItem={(item: any) => (
				<List.Item
					css={listItemHover}
					actions={[
						<IconButton
							tooltip='置顶'
							icon={<PushpinOutlined />}
							checkedIcon={<PushpinFilled />}
							checked={item.pin}
							onClick={() => {
								fetcher(API_URLS.FAVORITES_PATCH, {
									postId: item.postId,
									pin: !item.pin,
								}).then(() => {
									return mutate();
								});
							}}
						/>,
						<IconButton
							tooltip='查询'
							icon={<SearchOutlined />}
							onClick={() => {
								history.push(
									`/app/detail?postId=${item.postId}&type=${item.type}&phone=${
										item.phone || ''
									}`
								);
							}}
						/>,
						<Popconfirm
							key='action-delete'
							placement='left'
							title={`确认删除 ${item.postId}?`}
							okType='danger'
							onConfirm={() => {
								fetcher(API_URLS.FAVORITES_REMOVE, item.postId).then(() => {
									mutate();
								});
							}}
						>
							<IconButton tooltip='删除' icon={<DeleteOutlined />} />
						</Popconfirm>,
					]}
				>
					<List.Item.Meta
						title={
							<div>
								{item.postId}{' '}
								{item.state === STATE_DELIVERED && (
									<CheckCircleFilled style={{fontSize: '0.8em'}} />
								)}
							</div>
						}
						description={
							<div>
								<LatestMessage time={item.updatedAt} message={item.message} />
								<TagList type={item.type} value={item.tags} />
							</div>
						}
					/>
				</List.Item>
			)}
		></List>
	);
}

export default Favorites;
