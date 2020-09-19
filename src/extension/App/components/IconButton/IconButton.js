import React from 'react';
import styled from '@emotion/styled';
import {Button, Tooltip} from 'antd';

export default function IconButton({tooltip, icon, checkedIcon, checked = false, ...rest}) {
	const button = (
		<Button
			style={{color: 'inherit'}}
			type='link'
			shape='circle'
			icon={checked ? checkedIcon : icon}
			{...rest}
		/>
	);
	if (tooltip) {
		return <Tooltip title={tooltip}>{button}</Tooltip>;
	}
	return button;
}

export const InnerIconButton = styled(IconButton)`
	line-height: 1;
	height: auto;
	width: auto;
	min-width: auto;
	padding: 0;
`;
