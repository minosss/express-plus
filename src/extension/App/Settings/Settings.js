import React from 'react';
import {Switch, Select, List, Spin} from 'antd';
import useSWR from 'swr';
import {fetcher, getVersion, getHomePageUrl} from '../../utils';
import {API_URLS} from '@/shared/constants';

export default function Settings() {
	const {data = {}, isValidating, mutate} = useSWR(API_URLS.SETTINGS);

	const updateSetings = async (key, value) => {
		const patch = await fetcher(API_URLS.SETTINGS_PATCH, {key, value});
		if (patch) {
			mutate({...data, ...{[key]: value}}, false);
		}
	};

	return (
		<Spin spinning={isValidating}>
			<div className=''>
				<List>
					<List.Item>自动查询</List.Item>
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
					<List.Item>关于</List.Item>
					<List.Item>
						<List.Item.Meta title='版本' description={`v${getVersion()}`} />
					</List.Item>
					<List.Item>
						<List.Item.Meta
							title='Github 项目'
							description={
								<a
									href={getHomePageUrl()}
									target='_blank'
									rel='noopener noreferrer'
								>
									{getHomePageUrl()}
								</a>
							}
						/>
					</List.Item>
				</List>
			</div>
		</Spin>
	);
}
