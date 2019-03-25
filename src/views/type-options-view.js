import React, {useCallback} from 'react';
import {Tag} from 'antd';
import {groupedCodeMap} from '../services/kuaidi';

const leters = 'abcdefghijklmnopqrstuvwxyz'.split('');

const GroupedMap = React.memo(props => {
  return (
    <div {...props}>
      {leters.map(key => {
        return groupedCodeMap[key] ? (
          <div key={`group-${key}`} className='company-group'>
            <h3 className='company-group-label'>{key}</h3>
            <div className='company-group-content'>
              {groupedCodeMap[key].map(({code, name}) => (
                <Tag key={`tag-${code}`} data-type={code}>
                  {name || code}
                </Tag>
              ))}
            </div>
          </div>
        ) : null;
      })}
    </div>
  );
});

export default function TypeOptionsView({match, history}) {
  const {postId} = match.params;
  const handlePush = useCallback(
    e => {
      const {type} = e.target.dataset;
      if (type === undefined) {
        return;
      }

      history.push({
        pathname: '/detail',
        search: `?postId=${postId}&type=${type}`
      });
    },
    [postId, history]
  );

  return (
    <div className='content'>
      <p className='type-label'>
        单号 <b>{postId}</b> 是哪个快递？
      </p>
      <GroupedMap onClick={handlePush} />
    </div>
  );
}
