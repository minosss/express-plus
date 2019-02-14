import React, {useCallback} from 'react';
import {Tag} from 'antd';
import {comCodeMap} from '../services/kuaidi-service';

const leters = 'abcdefghijklmnopqrstuvwxyz'.split('');

const GroupedMap = React.memo(props => {
  const data = Object.keys(comCodeMap).reduce((result, curr) => {
    const char = curr[0];
    if (Array.isArray(result[char])) {
      result[char].push(curr);
    } else {
      result[char] = [curr];
    }

    return result;
  }, {});

  return (
    <div {...props}>
      {leters.map(key => {
        return data[key] ?
          <div key={`group-${key}`} className='company-group'>
            <h3 className='company-group-label'>{key}</h3>
            <div className='company-group-content'>
              {data[key].map(code => (
                <Tag key={`tag-${code}`} data-type={code}>{comCodeMap[code]}</Tag>
              ))}
            </div>
          </div> : null;
      })}
    </div>
  );
});

export default function TypeOptionsView({match, history}) {
  const {postId} = match.params;
  const handlePush = useCallback(e => {
    const {type} = e.target.dataset;
    if (type === undefined) {
      return;
    }

    history.push(`/detail/${postId}/${type}`);
  }, [postId]);

  return (
    <div className='content'>
      <p className='type-label'>单号 <b>{postId}</b> 是哪个快递？</p>
      <GroupedMap onClick={handlePush} />
    </div>
  );
}
