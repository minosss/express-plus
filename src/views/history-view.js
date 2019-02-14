import React, {useState, useEffect, useCallback} from 'react';
import dayjs from 'dayjs';
import {List} from 'antd';
import TypeTag from '../components/type-tag';
import StorageService from '../services/storage-service';
import LatestMessage from '../components/latest-message';

function renderItem({postId, type, latestMessage, updatedAt}) {
  return (
    <List.Item key={`${postId}-${type}`}>
      <List.Item.Meta
        title={<>{postId}{' '}<TypeTag type={type} /></>}
        description={<LatestMessage {...latestMessage} />}
      />
      {updatedAt && dayjs(updatedAt).fromNow()}
      <div className='ant-list-item-mask' data-post-id={postId} data-type={type} />
    </List.Item>
  );
}

export default function HistoryView({history}) {
  const [dataSource, setDataSource] = useState([]);

  useEffect(() => {
    const data = StorageService.getAllHistory();
    setDataSource(data);
  }, []);

  const handlePush = useCallback(e => {
    const {postId, type} = e.target.dataset;
    if (postId && type) {
      history.push(`/detail/${postId}/${type}`);
    }
  });

  return (
    <List
      className='history-list'
      dataSource={dataSource}
      renderItem={renderItem}
      onClick={handlePush}
    />
  );
}
