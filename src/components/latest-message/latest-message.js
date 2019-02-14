import React from 'react';
import {Icon} from 'antd';
import dayjs from 'dayjs';

const LatestMessage = React.memo(({time, context}) => {
  if (time && context) {
    return (
      <div>
        {dayjs(time).fromNow()}{' '}
        <Icon type='clock-circle' /> {context}
      </div>
    );
  }

  return <div>无信息</div>;
});

export default LatestMessage;
