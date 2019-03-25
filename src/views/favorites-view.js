import React, {useCallback} from 'react';
import dayjs from 'dayjs';
import {useDispatch, useMappedState} from 'redux-react-hook';
import {List, Icon, Tag, Popconfirm, message} from 'antd';
import {Link} from 'react-router-dom';
import {STATE_DELIVERED} from '../services/kuaidi-service';
import {DELETE_FAVORITE} from '../store/actions';
import TypeTag from '../components/type-tag';
import LatestMessage from '../components/latest-message';

const MetaTitle = React.memo(({postId, state}) => {
  return (
    <>
      {postId}{' '}
      {state === STATE_DELIVERED && (
        <Icon type='check' style={{color: '#23d160'}} />
      )}
    </>
  );
});

// React.memo like pureComponent
const Tags = React.memo(({children, data}) => (
  <div>
    {children}
    {data && data.map(item => <Tag key={`tag-${item}`}>{item}</Tag>)}
  </div>
));

// 签收的往后排
function sortFavorites(a, b) {
  let r = 1;
  if (a.state !== STATE_DELIVERED && b.state === STATE_DELIVERED) {
    r = -1;
  }

  const aMsg = a.latestMessage || a.lastestData;
  const bMsg = b.latestMessage || b.lastestData;
  if (aMsg && bMsg) {
    if (dayjs(aMsg.time).isAfter(dayjs(bMsg.time))) {
      r = -1;
    } else {
      r = 1;
    }
  }

  return r;
}

export default function FavoritesView() {
  const mapState = useCallback(
    state => ({
      // 可能直接弄个copy不太好
      sortedFavorites: state.favorites.slice().sort(sortFavorites)
    }),
    []
  );

  const dispatch = useDispatch();
  const {sortedFavorites} = useMappedState(mapState);

  return (
    <List
      className='favorites-list'
      dataSource={sortedFavorites}
      renderItem={item => (
        <List.Item
          actions={[
            <Link
              key='action-search'
              to={{
                pathname: '/detail',
                search: `?postId=${item.postId}&type=${
                  item.type
                }&phone=${item.phone || ''}`
              }}
            >
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
            title={<MetaTitle postId={item.postId} state={item.state} />}
            description={
              <div>
                <LatestMessage {...item.latestMessage || item.lastestData} />
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
