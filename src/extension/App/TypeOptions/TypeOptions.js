import React from 'react';
import {BackTop, List} from 'antd';
import {TYPES_MAP} from '@/shared/utils/kuaidi';

export default function TypeOptions() {
	return (
		<div>
			<List header='选择快递'>
				{Object.values(TYPES_MAP).map((item) => (
					<List.Item key={item.type}>{item.name}</List.Item>
				))}
			</List>
			<BackTop target={() => document.querySelector('main')}></BackTop>
		</div>
	);
}
