/* @jsx jsx */
import {useState} from 'react';
import {Input, Table, Space, Button} from 'antd';
import {SearchOutlined} from '@ant-design/icons';
import {TYPES} from 'shared/utils/kuaidi';
import Highlighter from 'react-highlight-words';
import qs from 'query-string';
import {jsx, css} from '@emotion/react';
import {RouteComponentProps} from 'react-router-dom';
import {FilterDropdownProps} from 'antd/lib/table/interface';

interface TypeItem {
	type: string;
	name: string;
	key: string;
}

// make data source with key
const dataSource: TypeItem[] = TYPES.map((item) => ({key: item.type, ...item}));

const TypeOptions: React.FC<RouteComponentProps> = ({location, history}) => {
	const {type, postId, phone = ''} = qs.parse(location.search);
	const [searchText, setSearchText] = useState('');

	const handleResetSearch = (clearFilters?: Fn) => {
		clearFilters && clearFilters();
		setSearchText('');
	};

	const handleSearch = (selectedKeys: any[], confirm: Fn, dataIndex?: any) => {
		confirm();
		setSearchText(selectedKeys[0]);
	};

	const handleSelect = (record: TypeItem) => {
		history.push(`/app/detail?postId=${postId}&type=${record.type}&phone=${phone}`);
	};

	const columns = [
		{
			title: `${postId}是哪个快递?`,
			children: [
				{
					title: '名称',
					dataIndex: 'name',
					key: 'name',
					filterDropdown: ({
						setSelectedKeys,
						selectedKeys,
						confirm,
						clearFilters,
					}: FilterDropdownProps) => (
						<div style={{padding: 12}}>
							<Input
								style={{width: 188, marginBottom: 8, display: 'block'}}
								placeholder='搜索名称'
								value={selectedKeys[0]}
								onChange={(e) =>
									setSelectedKeys(e.target.value ? [e.target.value] : [])
								}
								onPressEnter={() => handleSearch(selectedKeys, confirm, 'name')}
							/>
							<Space>
								<Button
									style={{width: 90}}
									type='primary'
									size='small'
									icon={<SearchOutlined />}
									onClick={() => handleSearch(selectedKeys, confirm)}
								>
									搜索
								</Button>
								<Button
									style={{width: 90}}
									size='small'
									onClick={() => handleResetSearch(clearFilters)}
								>
									重置
								</Button>
							</Space>
						</div>
					),
					filterIcon: () => <SearchOutlined />,
					onFilter: (value: any, record: any) =>
						record.name
							? record.name.toString().toLowerCase().includes(value.toLowerCase())
							: '',
					onFilterDropdownVisibleChange: () => {},
					render: (text: any) => (
						<Highlighter
							highlightStyle={{
								backgroundColor: 'var(--warning-color)',
								padding: 0,
							}}
							searchWords={[searchText]}
							autoEscape
							textToHighlight={text ? text.toString() : ''}
						/>
					),
				},
				{
					title: '代码',
					dataIndex: 'type',
					key: 'type',
				},
			],
		},
	];

	return (
		<div>
			<Table
				css={css`
					.ant-table-row {
						cursor: pointer;

						&:hover {
							color: var(--primary-color);
						}
					}
				`}
				onRow={(record) => ({
					onClick: () => {
						handleSelect(record);
					},
				})}
				bordered
				scroll={{y: 400}}
				pagination={{defaultPageSize: 100}}
				columns={columns}
				dataSource={dataSource}
			/>
		</div>
	);
};

export default TypeOptions;
