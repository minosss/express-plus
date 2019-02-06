import React, {useCallback} from 'react';
import {useDispatch, useMappedState} from 'redux-react-hook';
import dayjs from 'dayjs';
import {List, Icon, Tag, Popconfirm, message} from 'antd';
import {Link} from 'react-router-dom';
import KuaidiService from '../services/kuaidi-service';
import {DELETE_FAVORITE} from '../store/actions';

// React.memo like pureComponent
const Tags = React.memo(({children, data}) => (
  <div>
    {children}
    {data && data.map(item => <Tag key={`tag-${item}`}>{item}</Tag>)}
  </div>
));

export default function FavoritesView() {
  const mapState = useCallback(state => ({
    favorites: state.favorites
  }), []);

  const dispatch = useDispatch();
  const {favorites} = useMappedState(mapState);

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
            // <a
            //   key='action-refresh'
            //   href='#'
            //   onClick={() => {
            // Set item is loading
            // and send update message to background
            // }}
            // >
            // <Icon type='sync' />
            // </a>,
            <Popconfirm
              key='action-delete'
              placement='left'
              title='确认删除？'
              okType='danger'
              okText='确定'
              cancelText='取消'
              onConfirm={() => {
                dispatch({
                  type: DELETE_FAVORITE,
                  postId: item.postId
                });
                message.success(`${item.postId} 已删除`);
              }}
            >
              <a href='#'>
                <Icon type='delete' style={{color: '#eb2f96'}} />
              </a>
            </Popconfirm>
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
                <Tags data={item.tags}>
                  <Tag color='geekblue'>{KuaidiService.getCompanyName(item.type)}</Tag>
                </Tags>
              </div>
            }
          />
        </List.Item>
      )}
    />
  );
}
