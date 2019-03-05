import React, {useState, useEffect, useCallback} from 'react';
import {Spin, Timeline, Divider, Button, Tooltip, Icon, Alert, Modal} from 'antd';
import {Link} from 'react-router-dom';
import {produce} from 'immer';
import {useDispatch, useMappedState} from 'redux-react-hook';
import queryString from 'query-string';
import TagGroup from '../components/tag-group';
import VerificationCodeInput from '../components/verification-code-input';
import KuaidiService, {STATE_ERROR} from '../services/kuaidi-service';
import FavoriteModel from '../model/favorite-model';
import {
  DELETE_FAVORITE,
  CREATE_FAVORITE,
  UPDATE_TAGS,
  UPDATE_FAVORITE
} from '../store/actions';

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

  // -
  if (!postId || !type) {
    history.push('/');
    return;
  }
  // -

  const selectFavoriteByPostId = useCallback(state => state.favorites.find(f => f.postId === postId), [postId]);
  const defaultData = useMappedState(selectFavoriteByPostId);

  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);

  const isFavorite = Boolean(defaultData);
  const [result, setResult] = useState({postId, type, phone, ...defaultData});

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
        setIsLoading(false);
      }
    });
  }, [postId, type]);

  async function queryData(force = false) {
    let preResult = result;

    setIsLoading(true);
    if (force) {
      preResult = {postId, type, phone, ...defaultData};
      setResult(preResult);
    }

    if (type === 'shunfeng' && !phone) {
      if (preResult.phone === '') {
        showPhoneInputModel();
      } else {
        history.push({
          pathname: '/detail',
          search: `?postId=${postId}&type=${type}&phone=${preResult.phone}`
        });
      }

      return;
    }

    const jsonData = await KuaidiService.query({postId, type, phone});
    const nextResult = {...preResult, ...jsonData};

    setIsLoading(false);
    setResult(nextResult);

    if (jsonData.state === STATE_ERROR) {
      return;
    }

    // 如果已经收藏的，查询后需要更新最新消息
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
  }

  useEffect(() => {
    queryData(true);
    return () => {};
  }, [postId, type, phone]);

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

  const handleRefresh = () => {
    queryData();
  };

  const updateTags = tags => {
    setResult(
      produce(result, draft => {
        draft.tags = tags;
      })
    );
    // TODO 跟更新合并只更新个别属性
    if (isFavorite) {
      dispatch({type: UPDATE_TAGS, postId, tags});
    }
  };

  return (
    <Spin tip='加载中' spinning={isLoading}>
      <div className='content'>
        <div>
          <div>
            <h2 style={{display: 'inline-block'}}>{result.postId}</h2>
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
                  {KuaidiService.getCompanyName(result.type)}
                  <Tooltip title='选择快递'>
                    <Link to={`/select/${result.postId}`} style={{marginLeft: 10}}>
                      <Icon type='edit' />
                    </Link>
                  </Tooltip>
                </td>
              </tr>
              {type === 'shunfeng' && (
                <tr>
                  <td>验证码：</td>
                  <td>
                    {result.phone}
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
                  <TagGroup editable tags={result.tags} onChange={updateTags} />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <Divider />
        {result.message && <Alert message={result.message} type='warning' />}
        <TimelineList data={result.data || []} />
      </div>
    </Spin>
  );
}
