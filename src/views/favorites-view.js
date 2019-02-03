import React, {useContext} from 'react';
import dayjs from 'dayjs';
import {List, Icon, Tag} from 'antd';
import {Link} from 'react-router-dom';
import {DELETE_FAVORITE} from '../reducers/favorites';
import {StateContext} from '../app';

// React.memo like pureComponent
const Tags = React.memo(({data}) => (
  <div>{data && data.map(item => <Tag key={`tag-${item}`}>{item}</Tag>)}</div>
));

export default function FavoritesView({favorites = []}) {
  const dispatch = useContext(StateContext);

  return (
    <List
      className='favorites-list'
      dataSource={favorites}
      renderItem={item => (
        <List.Item
          actions={[
            <Link key='action-search' to={`/detail/${item.postId}/${item.type}`}>
              <Icon type='search' />
            </Link>,
            <a
              key='action-refresh'
              href='#'
              onClick={() => {
                // Set item is loading
                // and send update message to background
              }}
            >
              <Icon type='sync' />
            </a>,
            <a
              key='action-delete'
              href='#'
              onClick={() => {
                dispatch({
                  type: DELETE_FAVORITE,
                  payload: {postId: item.postId}
                });
              }}
            >
              <Icon type='delete' style={{color: '#eb2f96'}} />
            </a>
          ]}
        >
          <List.Item.Meta
            title={item.postId}
            description={
              <div>
                <p>
                  {dayjs(item.lastestData.time).fromNow()}{' '}
                  <Icon type='clock-circle' /> {item.lastestData.context}
                </p>
                <Tags data={item.tags} />
              </div>
            }
          />
        </List.Item>
      )}
    />
  );
}
