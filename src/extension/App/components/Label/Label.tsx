import React from 'react';
import {TYPES_MAP, STATES_MAP} from 'shared/utils/kuaidi';
import styled from '@emotion/styled';

const Label = styled.div`
	display: inline-flex;
	flex-shrink: 0;
`;

interface LabelProps extends Record<string, any> {
	value: string;
}

export const TypeLabel: React.FC<LabelProps> = ({value, ...rest}) => (
	<Label {...rest}>{(TYPES_MAP[value] && TYPES_MAP[value].name) || '未知'}</Label>
);

export const StateLabel: React.FC<LabelProps> = ({value, ...rest}) => (
	<Label {...rest}>{STATES_MAP[value] || '未知'}</Label>
);
