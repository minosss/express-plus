import React, {useEffect, useState} from 'react';
import {Switch, Select, List, Spin, Button, message} from 'antd';
import {GithubOutlined, ShopOutlined} from '@ant-design/icons';
import useSWR from 'swr';
import dayjs from 'dayjs';
import {fetcher, getVersion, getHomePageUrl, getStoreUrl} from '../../utils';
import {API_URLS, SETTING_KEYS} from '@/shared/constants';

export default function Settings() {
	const {data = {}, isValidating, mutate} = useSWR(API_URLS.SETTINGS);
	const [lastRefresh, setLastRefresh] = useState('waiting...');

	// 更新设置
	const updateSetings = async (key, value) => {
		const patch = await fetcher(API_URLS.SETTINGS_PATCH, {key, value});
		if (patch) {
			mutate({...data, ...{[key]: value}}, false);
		}
	};

	// 强刷 Cookies
	const handleRefreshCookies = async () => {
		const time = await fetcher(API_URLS.REFRESH_COOKIES);
		if (time) {
			mutate({...data, cookieKuaidi100: time}, false);
		}
	};

	//
	const handleHistoriesClear = async () => {
		const done = await fetcher(API_URLS.HISTORIES_CLEAR);
		if (done) message.info('历史记录已清空');
	};

	useEffect(() => {
		const inter = setInterval(() => {
			setLastRefresh(
				data.cookieKuaidi100 ? dayjs(data.cookieKuaidi100).fromNow() : 'waiting...'
			);
		}, 5000);
		return () => {
			clearInterval(inter);
		};
	}, [data]);

	return (
		<Spin spinning={isValidating}>
			<div className=''>
				<List>
					<List.Item>
						<List.Item.Meta
							className='text-center'
							description='如果觉得这个插件还蛮好用的，可以到商店给个星星'
						/>
					</List.Item>
					<List.Item
						actions={[
							<Switch
								checked={data[SETTING_KEYS.ENABLE_AUTO]}
								onChange={(value) => {
									updateSetings(SETTING_KEYS.ENABLE_AUTO, value);
								}}
							/>,
						]}
					>
						<List.Item.Meta
							title='开启自动查询'
							description='默认开启，后台定时自动查询未签收的快递。'
						/>
					</List.Item>
					<List.Item
						actions={[
							<Switch
								checked={data[SETTING_KEYS.ENABLE_FILTER_DELIVERED]}
								onChange={(value) => {
									updateSetings(SETTING_KEYS.ENABLE_FILTER_DELIVERED, value);
								}}
							/>,
						]}
					>
						<List.Item.Meta
							title='只提示已签收快递'
							description='默认开启，勾选后只有在快递状态为签收后才提示信息。'
						/>
					</List.Item>
					<List.Item
						actions={[
							<Select
								value={data[SETTING_KEYS.AUTO_INTERVAL]}
								onChange={(value) => {
									updateSetings(SETTING_KEYS.AUTO_INTERVAL, parseInt(value));
								}}
							>
								<Select.Option value='60'>60</Select.Option>
								<Select.Option value='120'>120</Select.Option>
								<Select.Option value='180'>180</Select.Option>
							</Select>,
						]}
					>
						<List.Item.Meta title='查询间隔（分钟）' description='默认60分钟' />
					</List.Item>
					<List.Item
						actions={[
							<Button danger onClick={handleRefreshCookies}>
								强制刷新
							</Button>,
						]}
					>
						<List.Item.Meta title='最后刷新 Cookie' description={lastRefresh} />
					</List.Item>
					<List.Item
						actions={[<Button onClick={handleHistoriesClear}>清空记录</Button>]}
					>
						<List.Item.Meta title='历史记录' description='显示最近的100条记录' />
					</List.Item>
					<List.Item
						actions={[
							<Button
								target='_blank'
								rel='noopener noreferrer'
								href={getHomePageUrl()}
								icon={<GithubOutlined />}
								shape='circle'
							></Button>,
							<Button
								target='_blank'
								rel='noopener noreferrer'
								href={getStoreUrl()}
								icon={<ShopOutlined />}
								shape='circle'
							></Button>,
						]}
					>
						<List.Item.Meta title='版本' description={`v${getVersion()}`} />
					</List.Item>
					<List.Item>
						<List.Item.Meta
							className='text-center'
							description='© 2015-2020 快递助手 - 由快递100强力驱动'
						/>
					</List.Item>
				</List>
			</div>
		</Spin>
	);
}
