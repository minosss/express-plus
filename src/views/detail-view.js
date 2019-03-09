import React, {useCallback} from 'react';
import {Spin, Timeline, Divider, Button, Tooltip, Icon, Alert, Modal} from 'antd';
import {Link} from 'react-router-dom';
import {useDispatch, useMappedState} from 'redux-react-hook';
import queryString from 'query-string';
import TagGroup from '../components/tag-group';
import VerificationCodeInput from '../components/verification-code-input';
import KuaidiService from '../services/kuaidi-service';
import FavoriteModel from '../model/favorite-model';
import {
  DELETE_FAVORITE,
  CREATE_FAVORITE,
  UPDATE_TAGS,
  UPDATE_FAVORITE
} from '../store/actions';
import {useAsync} from '../hooks';

const TimeDot = React.memo(({time}) => {
  const ary = time.split(' ');
  return (
    <div className='timedot'>
      {ary[1]}<br />
      <small>{ary[0]}</small>
    </div>
  );
});

const TimelineList = React.memo(({data}) => (
  <Timeline className='detail-data-timeline'>
    {data.map((item, index) => (
      <Timeline.Item
        // eslint-disable-next-line react/no-array-index-key
        key={`list-item-${index}`}
        dot={<TimeDot time={item.time} />}
        className={index === 0 ? 'is-active' : ''}
      >
        {item.context}
      </Timeline.Item>
    ))}
  </Timeline>
));

export default function DetailView({location, history}) {
  const {postId, type, phone} = queryString.parse(location.search);

  // 获取收藏
  const selectFavoriteByPostId = useCallback(state => state.favorites.find(f => f.postId === postId), [postId]);
  const defaultData = useMappedState(selectFavoriteByPostId);
  const dispatch = useDispatch();
  const isFavorite = Boolean(defaultData);

  const {loading, value} = useAsync(async () => {
    if (!postId || !type) {
      history.push('/');
      return Promise.resolve();
    }

    if (type === 'shunfeng' && !phone) {
      if (defaultData && defaultData.phone) {
        history.push({
          pathname: '/detail',
          search: `?postId=${postId}&type=${type}&phone=${defaultData.phone}`
        });
        return Promise.resolve();
      }

      showPhoneInputModel();
      return Promise.resolve({postId, type});
    }

    const jsonData = await KuaidiService.query({postId, type, phone});
    const nextResult = {...defaultData, ...jsonData};

    if (isFavorite) {
      if (
        nextResult.data &&
        nextResult.data.length > 0 &&
        nextResult.data[0].time !== nextResult.latestMessage.time
      ) {
        // 全覆盖更新
        dispatch({
          type: UPDATE_FAVORITE,
          favorite: FavoriteModel.fromObject(nextResult).update()
        });
      }
    }

    return Promise.resolve(nextResult);
  }, [type, postId, phone]);

  const showPhoneInputModel = useCallback(e => {
    if (e) {
      e.preventDefault();
    }

    let inputVal;
    Modal.confirm({
      width: 340,
      centered: true,
      title: '请输入收/寄件人联系方式后四位',
      content: (
        <>
          <p>查询顺丰快递需要提供联系方式后四位</p>
          <VerificationCodeInput onComplete={val => {
            inputVal = val;
          }} />
        </>
      ),
      onOk() {
        history.push({
          pathname: '/detail',
          search: `?postId=${postId}&type=${type}&phone=${inputVal}`
        });
      },
      onCancel() {
        // setIsLoading(false);
      }
    });
  }, [postId, type, history]);

  const handleToggleFavorite = () => {
    const nextIsFavorite = !isFavorite;
    if (nextIsFavorite) {
      dispatch({
        type: CREATE_FAVORITE,
        favorite: FavoriteModel.fromObject(result)
      });
    } else {
      dispatch({type: DELETE_FAVORITE, postId});
    }
  };

  const handleRefresh = useCallback(() => {}, []);

  const updateTags = tags => {
    // TODO 跟更新合并只更新个别属性
    if (isFavorite) {
      dispatch({type: UPDATE_TAGS, postId, tags});
    }
  };

  const result = {postId, type, ...value};

  return (
    <Spin tip='加载中' spinning={loading}>
      <div className='content'>
        <div>
          <div>
            <h2 style={{display: 'inline-block'}}>{postId}</h2>
            <Tooltip title='刷新'>
              <Button
                style={{marginLeft: 10}}
                icon='sync'
                shape='circle'
                type='dashed'
                onClick={handleRefresh}
              />
            </Tooltip>
            <Tooltip title='收藏'>
              <Button
                style={{marginLeft: 10}}
                shape='circle'
                type='dashed'
                onClick={handleToggleFavorite}
              >
                <Icon type='star' theme={isFavorite ? 'filled' : 'outlined'} />
              </Button>
            </Tooltip>
          </div>
          <table>
            <tbody>
              <tr>
                <td>快递：</td>
                <td>
                  {KuaidiService.getCompanyName(type)}
                  <Tooltip title='选择快递'>
                    <Link to={`/select/${postId}`} style={{marginLeft: 10}}>
                      <Icon type='edit' />
                    </Link>
                  </Tooltip>
                </td>
              </tr>
              {type === 'shunfeng' && (
                <tr>
                  <td>验证码：</td>
                  <td>
                    {phone}
                    <Tooltip title='输入验证码'>
                      <a href='#' style={{marginLeft: 10}} onClick={showPhoneInputModel}>
                        <Icon type='edit' />
                      </a>
                    </Tooltip>
                  </td>
                </tr>
              )}
              <tr>
                <td>状态：</td>
                <td>{KuaidiService.getStateLabel(result.state)}</td>
              </tr>
              <tr>
                <td style={{whiteSpace: 'nowrap'}}>标签：</td>
                <td>
                  <TagGroup editable defaultTags={result.tags} onChange={updateTags} />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <Divider />
        {result.message && <Alert message={result.message} type='warning' />}
        <TimelineList data={(result.data) || []} />
      </div>
    </Spin>
  );
}
