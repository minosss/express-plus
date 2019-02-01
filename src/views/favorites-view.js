/* eslint-disable jsx-a11y/anchor-is-valid */
import React, {useContext} from 'react';
import Helmet from 'react-helmet';
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
    <>
      <Helmet title='我的收藏' />
      <List
        className='favorites-list'
        dataSource={favorites}
        renderItem={item => (
          <List.Item
            actions={[
              <Link to={`/detail/${item.postId}/${item.type}`}>
                <Icon type='search' />
              </Link>,
              <a
                href='#'
                onClick={() => {
                  // set item is loading
                  // and send update message to background
                }}
              >
                <Icon type='sync' />
              </a>,
              <a
                href='#'
                onClick={() => {
                  dispatch({
                    type: DELETE_FAVORITE,
                    payload: {postId: item.postId},
                  });
                }}
              >
                <Icon type='delete' style={{color: '#eb2f96'}} />
              </a>,
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
    </>
  );
}
