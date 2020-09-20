/* @jsx jsx */
import {List} from 'antd';
import useSWR from 'swr';
import dayjs from 'dayjs';
import {css, jsx} from '@emotion/core';
import {API_URLS} from '@/shared/constants';
import {TypeLabel} from '../components';

const listItemHover = css`
	transition: background 0.3s;
	cursor: pointer;

	&:hover {
		background: var(--list-item-hover-color);
	}
`;

export default function Histories({history}) {
	const {data = [], isValidating} = useSWR(API_URLS.HISTORIES);

	const handleClickItem = ({postId, type, phone = ''}) => {
		history.push(`/app/detail?postId=${postId}&type=${type}&phone=${phone}`);
	};

	return (
		<List
			loading={isValidating}
			dataSource={data}
			renderItem={(item) => (
				<List.Item
					css={listItemHover}
					actions={[<span>{dayjs(item.updatedAt).fromNow()}</span>]}
					onClick={() => handleClickItem(item)}
				>
					<List.Item.Meta
						title={item.postId}
						description={<TypeLabel value={item.type} />}
					/>
				</List.Item>
			)}
		/>
	);
}
