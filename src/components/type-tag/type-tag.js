import React from 'react';
import {Tag} from 'antd';
import KuaidiService from '../../services/kuaidi-service';

const TypeTag = React.memo(({type}) => (
  <Tag color='geekblue'>{KuaidiService.getCompanyName(type)}</Tag>
));

export default TypeTag;
