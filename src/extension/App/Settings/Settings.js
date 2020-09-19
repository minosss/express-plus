import React, {useEffect, useState} from 'react';
import {Switch, Select, List, Spin, Button} from 'antd';
import {
	InfoCircleOutlined,
	ClockCircleOutlined,
	GithubOutlined,
	ShopOutlined,
} from '@ant-design/icons';
import useSWR from 'swr';
import dayjs from 'dayjs';
import {fetcher, getVersion, getHomePageUrl, getStoreUrl} from '../../utils';
import {API_URLS} from '@/shared/constants';

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
						<ClockCircleOutlined /> 自动查询
					</List.Item>
					<List.Item
						actions={[
							<Switch
								checked={data.enableAuto}
								onChange={(value) => {
									updateSetings('enableAuto', value);
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
								checked={data.enableFilterDelivered}
								onChange={(value) => {
									updateSetings('enableFilterDelivered', value);
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
								value={data.autoInterval}
								onChange={(value) => {
									updateSetings('autoInterval', parseInt(value));
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
					<List.Item>
						<InfoCircleOutlined /> 关于
					</List.Item>
					<List.Item
						actions={[
							<Button
								target='_blank'
								rel='noopener noreferrer'
								href={getHomePageUrl()}
								icon={<GithubOutlined />}
							>
								Github
							</Button>,
							<Button
								target='_blank'
								rel='noopener noreferrer'
								href={getStoreUrl()}
								icon={<ShopOutlined />}
							>
								Web Store
							</Button>,
						]}
					>
						<List.Item.Meta title='版本' description={`v${getVersion()}`} />
					</List.Item>
				</List>
			</div>
		</Spin>
	);
}
