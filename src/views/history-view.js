import React, {useCallback} from 'react';
import dayjs from 'dayjs';
import {List} from 'antd';
import TypeTag from '../components/type-tag';
import StorageService from '../services/storage-service';
import LatestMessage from '../components/latest-message';
import {useAsync} from '../hooks';

function renderItem({postId, type, latestMessage, updatedAt}) {
  return (
    <List.Item key={`${postId}-${type}`}>
      <List.Item.Meta
        title={<>{postId}{' '}<TypeTag type={type} /></>}
        description={<LatestMessage {...latestMessage} />}
      />
      <span style={{alignSelf: 'center'}}>{updatedAt && dayjs(updatedAt).fromNow()}</span>
      <div className='ant-list-item-mask' data-post-id={postId} data-type={type} />
    </List.Item>
  );
}

export default function HistoryView({history}) {
  const {value: dataSource} = useAsync(async () => {
    return StorageService.getAllHistory();
  }, []);

  const handlePush = useCallback(e => {
    const {postId, type} = e.target.dataset;
    if (postId && type) {
      history.push({
        pathname: '/detail',
        search: `?postId=${postId}&type=${type}`
      });
    }
  }, [history]);

  return (
    <List
      className='history-list'
      dataSource={dataSource}
      renderItem={renderItem}
      onClick={handlePush}
    />
  );
}
