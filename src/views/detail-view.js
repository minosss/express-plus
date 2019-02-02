import React, {useState, useEffect, useContext, useCallback} from 'react';
import {Spin, Timeline, Divider, Button, Tooltip, Icon, Alert} from 'antd';
import TagGroup from '../components/tag-group';
import KuaidiService from '../services/KuaidiService';
import FavoriteModel from '../model/FavoriteModel';
import {StateContext} from '../app';
import {
  DELETE_FAVORITE,
  CREATE_FAVORITE,
  UPDATE_TAGS,
  UPDATE_FAVORITE,
} from '../reducers/favorites';
import produce from 'immer';

const TimelineList = React.memo(({data}) => (
  <Timeline>
    {data.map((item, index) => (
      <Timeline.Item
        key={`list-item-${index}`}
        color={index !== 0 ? '#666' : '#222'}
      >
        <span style={{color: index !== 0 ? '#666' : '#222'}}>
          {item.context}
        </span>
      </Timeline.Item>
    ))}
  </Timeline>
));

export default function DetailView({defaultData, match}) {
  const {postId, type} = match.params;

  const dispatch = useContext(StateContext);
  const [message, setMessage] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(!!defaultData);
  const [result, setResult] = useState(() => {
    const res = defaultData || {postId, type};
    return res;
  });

  useEffect(() => {
    KuaidiService.query(postId, type)
      .then(jsonData => {
        const nextResult = produce(result, draft => {
          Object.keys(jsonData).forEach(key => {
            draft[key] = jsonData[key];
          });
        });
        setIsLoading(false);
        setResult(nextResult);
        // 如果已经收藏的，查询后需要更新最新消息
        if (isFavorite) {
          try {
            if (nextResult.data[0].time !== nextResult.lastestData.time) {
              // 全覆盖更新
              dispatch({
                type: UPDATE_FAVORITE,
                payload: FavoriteModel.fromObject(nextResult).update(),
              });
            }
          } catch (_) {
            // ignore
          }
        }
      })
      .catch(err => {
        setIsLoading(false);
        setMessage(err.message);
      });
    // TODO maybe need cancel query, when query was not finished.
    return () => {};
  }, []);

  const handleToggleFavorite = () => {
    const nextIsFavorite = !isFavorite;
    if (nextIsFavorite) {
      dispatch({
        type: CREATE_FAVORITE,
        payload: FavoriteModel.fromObject(result),
      });
    } else {
      dispatch({type: DELETE_FAVORITE, payload: {postId}});
    }
    setIsFavorite(nextIsFavorite);
  };

  const handleRefresh = () => {};

  const updateTags = useCallback(tags => {
    setResult(
      produce(result, draft => {
        draft.tags = tags;
      })
    );
    // TODO 跟更新合并只更新个别属性
    dispatch({type: UPDATE_TAGS, payload: {postId, tags}});
  });

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
                <td>{KuaidiService.getCompanyName(result.type)}</td>
              </tr>
              <tr>
                <td>状态：</td>
                <td>{KuaidiService.getStateLabel(result.state)}</td>
              </tr>
              <tr>
                <td style={{whiteSpace: 'nowrap'}}>标签：</td>
                <td>
                  <TagGroup tags={result.tags} onChange={updateTags} editable />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <Divider />
        {message && <Alert message={message} type='error' showIcon />}
        <TimelineList data={result.data || []} />
      </div>
    </Spin>
  );
}
