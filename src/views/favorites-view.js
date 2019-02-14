import React, {useCallback} from 'react';
import {useDispatch, useMappedState} from 'redux-react-hook';
import {List, Icon, Tag, Popconfirm, message} from 'antd';
import {Link} from 'react-router-dom';
import {STATE_DELIVERED} from '../services/kuaidi-service';
import {DELETE_FAVORITE} from '../store/actions';
import TypeTag from '../components/type-tag';
import LatestMessage from '../components/latest-message';

// React.memo like pureComponent
const Tags = React.memo(({children, data}) => (
  <div>
    {children}
    {data && data.map(item => <Tag key={`tag-${item}`}>{item}</Tag>)}
  </div>
));

// 签收的往后排
function sortFavorites(a, b) {
  if (a.state !== STATE_DELIVERED && b.state === STATE_DELIVERED) {
    return -1;
  }

  return 1;
}

export default function FavoritesView() {
  const mapState = useCallback(state => ({
    sortedFavorites: state.favorites.sort(sortFavorites)
  }), []);

  const dispatch = useDispatch();
  const {sortedFavorites} = useMappedState(mapState);

  return (
    <List
      className='favorites-list'
      dataSource={sortedFavorites}
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
                <LatestMessage {...item.lastestData} />
                <Tags data={item.tags}>
                  <TypeTag type={item.type} />
                </Tags>
              </div>
            }
          />
        </List.Item>
      )}
    />
  );
}
