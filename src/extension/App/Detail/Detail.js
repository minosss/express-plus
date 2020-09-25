import React, {useState, useEffect} from 'react';
import {Spin, Divider, Timeline, Descriptions, Result, Modal, Input} from 'antd';
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
import {TypeLabel, StateLabel, IconButton, InnerIconButton, TagList} from '../components';
import {fetcher, toFavorite} from '../../utils';
import {STATE_DELIVERED} from '@/shared/utils/kuaidi';
import {API_URLS} from '@/shared/constants';

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
				<div title={item.time}>
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

// const getPhoneCode = async () => {
// 	return new Promise((resolve, reject) => {
// 		const modal = Modal.info({
// 			title: '顺丰快递需要输入手机后 4 位',
// 			content: <Input ref={}></Input>,
// 			onOk: () => {
// 				resolve(1234);
// 			},
// 			onCancel: () => {},
// 			okCancel: true,
// 		});
// 	});
// };

const NumberInput = (props) => (
	<Input
		{...props}
		maxLength={4}
		onChange={(e) => {
			const {value} = e.target;
			const reg = /^-?\d*(\.\d*)?$/;
			if ((!isNaN(value) && reg.test(value)) || value === '' || value === '-') {
				props.onChange(value);
			}
		}}
	></Input>
);

const TYPE_SF = 'shunfeng';
export default function Detail({location, history}) {
	const {type, postId, phone = ''} = qs.parse(location.search);
	const [inputPhone, setInputPhone] = useState(phone);
	const [isSaved, setSaved] = useState(false);
	const [showCodeInput, setShowCodeInput] = useState(false);
	const needPhone = type === TYPE_SF && (phone === '' || phone.length < 4);

	const {data, isValidating, mutate} = useSWR(() => {
		if (needPhone) {
			return false;
		} else {
			return ['/kuaidi/query', JSON.stringify({type, postId, phone})];
		}
	});

	useEffect(() => {
		if (needPhone) {
			setShowCodeInput(true);
		}
	}, [needPhone]);

	useEffect(() => {
		setSaved(data && data.updatedAt && data.message);
	}, [data]);

	// 收藏
	const handleToggleChecked = () => {
		if (isSaved) {
			fetcher(API_URLS.FAVORITES_REMOVE, postId).then(() => {
				setSaved(false);
			});
		} else {
			fetcher(API_URLS.FAVORITES_ADD, toFavorite(data)).then((res) => {
				setSaved(true);
			});
		}
	};

	// 换其他快递
	const handleSelect = () => {
		history.push(`/app/select?postId=${postId}&type=${type}&phone=${phone}`);
	};

	// 标签处理
	const handleTagChange = (tags) => {
		if (isSaved) {
			// 已订阅先保存
			fetcher(API_URLS.FAVORITES_PATCH, {postId, tags}).then(() => {
				mutate({...data, tags}, false);
			});
		} else {
			// 刷新本地数据
			mutate({...data, tags}, false);
		}
	};

	// 收货
	// const handleMakeDelivered = () => {
	// 	if (isSaved) {
	// 		fetcher(API_URLS.FAVORITES_PATCH, {
	// 			postId,
	// 			state: STATE_DELIVERED,
	// 		});
	// 	}
	// };

	const {data: messages, state, error, tags} = data || {};

	return (
		<>
			<Spin spinning={isValidating}>
				<div className='view-detail'>
					<div className='m-4'>
						<Title>
							<span>{postId}</span>
							<IconButton tooltip='刷新' icon={<ReloadOutlined />} />
							<IconButton
								tooltip={`${isSaved ? '取消' : '点击'}收藏`}
								icon={<StarOutlined />}
								checkedIcon={<StarFilled />}
								checked={isSaved}
								onClick={handleToggleChecked}
							/>
						</Title>
						<Descriptions size='small' column={3}>
							<Descriptions.Item label='快递'>
								<TypeLabel value={type} />
								<InnerIconButton
									onClick={handleSelect}
									tooltip='选择快递'
									icon={<EditOutlined />}
								/>
							</Descriptions.Item>
							<Descriptions.Item label='状态'>
								<StateLabel value={state} />
								{/* {!isDelivered(state) && isSaved && (
								<InnerIconButton
									onClick={handleMakeDelivered}
									tooltip='确认收货'
									icon={<CheckOutlined />}
								/>
							)} */}
							</Descriptions.Item>
							{type === TYPE_SF ? (
								<Descriptions.Item label='手机'>
									{phone}{' '}
									<InnerIconButton
										onClick={() => {
											setShowCodeInput(true);
										}}
										tooltip='修改手机'
										icon={<EditOutlined />}
									/>
								</Descriptions.Item>
							) : (
								<Descriptions.Item />
							)}
							<Descriptions.Item label='标签'>
								<TagList
									editable
									value={tags}
									onChange={handleTagChange}
								></TagList>
							</Descriptions.Item>
						</Descriptions>
					</div>
					<Divider className='m-0' />
					{Array.isArray(messages) && messages.length > 0 && (
						<TimelineList value={messages} state={state} />
					)}
					{error && (
						<Result status='error' title='请求错误' subTitle={error.toSring()} />
					)}
				</div>
			</Spin>
			<Modal
				title='输入后4位号码'
				visible={showCodeInput}
				onOk={() => {
					if (inputPhone.length === 4) {
						history.replace(
							`/app/detail?postId=${postId}&type=${type}&phone=${inputPhone}`
						);
						setShowCodeInput(false);
					}
				}}
				onCancel={() => {
					setShowCodeInput(false);
					setInputPhone(phone);
				}}
				width={200}
			>
				<NumberInput
					value={inputPhone}
					onChange={(value) => {
						setInputPhone(value);
					}}
				/>
			</Modal>
		</>
	);
}
