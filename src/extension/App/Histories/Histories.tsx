/* @jsx jsx */
import {List} from 'antd';
import useSWR from 'swr';
import dayjs from 'dayjs';
import {css, jsx} from '@emotion/react';
import {API_URLS} from 'shared/constants';
import {TypeLabel} from '../components';
import {RouteComponentProps} from 'react-router-dom';

const listItemHover = css`
	transition: background 0.3s;
	cursor: pointer;

	&:hover {
		background: var(--list-item-hover-color);
	}
`;

const Histories: React.FC<RouteComponentProps> = ({history}) => {
	const {data = [], isValidating} = useSWR(API_URLS.HISTORIES);

	const handleClickItem = ({postId, type, phone = ''}: any) => {
		history.push(`/app/detail?postId=${postId}&type=${type}&phone=${phone}`);
	};

	return (
		<List
			loading={isValidating}
			dataSource={data}
			renderItem={(item: any) => (
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

export default Histories;
