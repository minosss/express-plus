/** @jsx jsx */
import {useState} from 'react';
import useSWR from 'swr';
import {useDebounce} from 'react-use';
import {Link, useHistory} from 'react-router-dom';
import {jsx} from '@emotion/core';
import styled from '@emotion/styled';
import {AutoComplete, Input, Menu, Dropdown} from 'antd';
import {
	InboxOutlined,
	MenuOutlined,
	SearchOutlined,
	SettingOutlined,
	GithubOutlined,
	SmileOutlined,
	LoadingOutlined,
	HistoryOutlined,
} from '@ant-design/icons';
import {TypeLabel} from '../index';
import {reportIssue, getStoreUrl} from '../../../utils';

const useDebounceAuto = (value, refresh = false) => {
	const [state, setState] = useState(value);
	const [showHistory, setShowHistory] = useState(refresh);

	useDebounce(
		() => {
			console.log('typing stop');
			setState(value);
			setShowHistory(value === '');
		},
		500,
		[value]
	);

	const {data, error, isValidating, mutate} = useSWR(() => {
		return showHistory ? ['/histories', 7] : state ?? ['/kuaidi/auto', state];
	});

	return {data, error, isValidating, mutate};
};

const HOME_PAGE = '/app/favorites';
const menu = (
	<Menu>
		<Menu.Item key='favorites'>
			<Link to='/app/favorites'>
				<InboxOutlined /> 收藏列表
			</Link>
		</Menu.Item>
		<Menu.Item>
			<Link to='/app/histories'>
				<HistoryOutlined /> 历史记录
			</Link>
		</Menu.Item>
		<Menu.Item key='settings'>
			<Link to='/app/settings'>
				<SettingOutlined /> 设置
			</Link>
		</Menu.Item>
		<Menu.Item key='store'>
			<a href={getStoreUrl()} target='_blank' rel='noopener noreferrer'>
				<SmileOutlined /> 去商店评价
			</a>
		</Menu.Item>
		<Menu.Item key='github'>
			<div onClick={reportIssue}>
				<GithubOutlined /> 去 Github 报错
			</div>
		</Menu.Item>
	</Menu>
);

const MenuAction = styled.a`
	margin: 0 1em;
	color: inherit;
`;

const NavbarWrapper = styled.div`
	display: flex;
	align-items: stretch;
	justify-content: space-between;
	flex-wrap: wrap;

	a {
		color: inherit;
		&:hover {
			color: inherit;
		}
	}
`;

const NavbarSection = styled.section`
	align-items: center;
	display: flex;
	flex: 1 0 0;

	&:not(:first-child):last-child {
		justify-content: flex-end;
	}
`;

const NavbarTitle = styled(Link)`
	font-size: 1rem;
`;

const OptionItemLabel = ({value}) => {
	return (
		<div
			css={{
				display: 'flex',
			}}
		>
			<div
				css={{
					flexGrow: 1,
					textOverflow: 'ellipsis',
					overflow: 'hidden',
				}}
			>
				{value.postId}
			</div>
			<TypeLabel
				css={{
					marginLeft: 4,
				}}
				value={value.type}
			></TypeLabel>
		</div>
	);
};

export default function Navbar() {
	const history = useHistory();
	const [inputValue, setInputValue] = useState('');
	const {data, isValidating, mutate} = useDebounceAuto(inputValue);

	const finalOptions = (data || []).map((item) => ({
		label: <OptionItemLabel value={item} />,
		value: `${item.postId}@${item.type}`,
		key: item.type,
		item,
	}));

	return (
		<NavbarWrapper>
			<NavbarSection>
				<NavbarTitle to={HOME_PAGE}>快递助手</NavbarTitle>
			</NavbarSection>
			<NavbarSection>
				<AutoComplete
					options={finalOptions}
					value={inputValue}
					onSelect={(value, {item}) => {
						history.push(`/app/detail?postId=${item.postId}&type=${item.type}`);
					}}
					onChange={(value, option) => {
						// 避免修改输入框的查询数据
						if (option.value) return;
						setInputValue(value);
					}}
					onFocus={() => {
						// 没值就获取历史记录
						if (inputValue === '') mutate();
					}}
				>
					<Input
						style={{width: 200}}
						placeholder='输入快递单号...'
						prefix={isValidating ? <LoadingOutlined /> : <SearchOutlined />}
					/>
				</AutoComplete>
				<Dropdown overlay={menu} trigger={['click']}>
					<MenuAction>
						<MenuOutlined />
					</MenuAction>
				</Dropdown>
			</NavbarSection>
		</NavbarWrapper>
	);
}
