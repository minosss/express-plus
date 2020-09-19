/** @jsx jsx */
import {useState, useMemo} from 'react';
import useSWR from 'swr';
import {useDebounce} from 'react-use';
import {Link, useHistory, useLocation} from 'react-router-dom';
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
	HomeOutlined,
} from '@ant-design/icons';
import {TypeLabel, IconButton} from '../index';
import {reportIssue, getStoreUri} from '../../../utils';

const useDebounceAuto = (value) => {
	const [state, setState] = useState(value);
	const [sholdFetch, setSholdFetch] = useState(false);

	useDebounce(
		() => {
			console.log('typing stop');
			setState(value);
			if (value !== '') {
				setSholdFetch(true);
			}
		},
		2000,
		[value]
	);

	const {data, error, isValidating} = useSWR(() => {
		return sholdFetch ? ['/kuaidi/auto', state] : null;
	});

	return {data, error, isValidating};
};

const HOME_PAGE = '/app/favorites';
const menu = (
	<Menu>
		<Menu.Item key='favorites'>
			<Link to='/app/favorites'>
				<InboxOutlined /> 收藏列表
			</Link>
		</Menu.Item>
		<Menu.Item key='settings'>
			<Link to='/app/settings'>
				<SettingOutlined /> 设置
			</Link>
		</Menu.Item>
		<Menu.Item key='store'>
			<a href={getStoreUri()} target='_blank' rel='noopener noreferrer'>
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

const NavbarTitle = styled.span`
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
	const location = useLocation();
	const history = useHistory();
	const [inputValue, setInputValue] = useState('');
	const {data, isValidating} = useDebounceAuto(inputValue);
	const isHomePage = location.pathname === HOME_PAGE;
	const title = useMemo(() => {
		console.log('run memo');
		switch (location.pathname) {
			case '/app/favorites':
				return '收藏列表';
			case '/app/settings':
				return '设置';
			case '/app/detail':
				return '详情';
			default:
				return '快递助手';
		}
	}, [location]);

	const finalOptions = (data || []).map((item) => ({
		label: <OptionItemLabel value={item} />,
		value: `${item.postId}@${item.type}`,
		key: item.type,
		item,
	}));

	return (
		<NavbarWrapper>
			<NavbarSection>
				{!isHomePage && (
					<IconButton
						onClick={() => {
							history.replace(HOME_PAGE);
						}}
						icon={<HomeOutlined />}
					/>
				)}
				<NavbarTitle>{title}</NavbarTitle>
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
