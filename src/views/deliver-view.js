/* eslint react/no-array-index-key: 1, promise/prefer-await-to-then: 1 */
import React, {memo, useCallback, useEffect, useState, useRef} from 'react';
import {Spin, List, Tag, Icon, AutoComplete, Input, Typography, message} from 'antd';
import debounce from 'lodash.debounce';
import {useAsync} from '../hooks';
import TypeTag from '../components/type-tag';
import KuaidiService from '../services/kuaidi-service';
import * as amap from '../services/amap';

const {Text} = Typography;

const OptionContent = memo(({item}) => {
  return (
    <>
      <Text>{item.name}</Text>
      <br />
      <Text type='secondary'>{item.district} ({item.address})</Text>
    </>
  );
});

const AmapInput = ({onPositionChange = () => {}}) => {
  const latestPosition = useRef();
  const [state, set] = useState({loading: false, disabled: false, data: []});

  const setState = useCallback(value => {
    set(state => ({...state, ...value}));
  }, []);

  const handleSearch = debounce(async keywords => {
    if (keywords.length >= 2) {
      setState({loading: true});
      const data = await amap.inputtips({keywords});
      if (data.status === '1') {
        setState({loading: false, data: data.tips});
      } else if (data.info !== 'OK') {
        message.error(`amap: ${data.info} (${data.infocode})`);
        setState({loading: false});
      }
    }
  }, 1000);

  const handleSelect = value => {
    const values = value.split(',');
    if (values.length === 2) {
      const position = {longitude: values[0], latitude: values[1]};
      latestPosition.current = position;
      onPositionChange(position);
    }
  };

  useEffect(() => {
    // geolocation 是异步的，这里用promise来处理返回的结果
    // 可是当请求还未完成的时候切换到其他页面时，这个页面会被卸载，页面都没了调用页面的方法就会报错
    // 这里用mounted来判断页面是否还存在
    let mounted = true;
    if (navigator.geolocation) {
      setState({loading: true, disabled: true});
      navigator.geolocation.getCurrentPosition(position => {
        if (mounted) {
          latestPosition.current = position;
          onPositionChange(position);
        }
      }, () => {
        if (mounted) {
          if (latestPosition.current) {
            message.info('使用上次定位数据');
            onPositionChange(latestPosition.current);
          } else {
            message.info('无法定位，请手动输入关键字搜索');
          }

          setState({loading: false, disabled: false});
        }
      }, {timeout: 5000});
    } else {
      message.info('无法定位，请手动输入关键字搜索');
      setState({loading: false, disabled: false});
    }

    return () => {
      mounted = false;
    };
  }, [onPositionChange, setState]);

  return (
    <AutoComplete
      style={{
        width: 350
      }}
      disabled={state.disabled}
      optionLabelProp='text'
      dataSource={state.data.map((item, index) => (
        <AutoComplete.Option key={`tips-${item.id}-${index}`} text={item.name} value={`${item.location}`}>
          <OptionContent item={item} />
        </AutoComplete.Option>
      ))}
      onSearch={handleSearch}
      onSelect={handleSelect}
    >
      <Input placeholder='输入地址关键字' prefix={<Icon type={state.loading ? 'loading' : 'environment'} />} />
    </AutoComplete>
  );
};

function DeliverView() {
  // 查询所需的参数
  const [params, setParams] = useState({});
  const handlePositionChange = useCallback(position => {
    setParams(position);
  }, []);

  // 使用自定义的hook来处理异步请求
  const {loading, value} = useAsync(async () => {
    const {latitude, longitude} = params;

    if (latitude && longitude) {
      const data = await KuaidiService.deliver({latitude, longitude});
      if (data.status === 200) {
        return Promise.resolve(data.data);
      }
    }

    return Promise.resolve([]);
  }, [params]);

  const renderItem = item => (
    <List.Item>
      <List.Item.Meta
        title={<span>{item.name || item.mktName} <Icon type='phone' /> {item.phone}</span>}
        description={
          (
            <div>
              <span>
                {item.address}
              </span>
              <div>
                {item.comlist.map((tag, idx) => <TypeTag key={`comlist-${idx}`} type={tag.kuaidiCom} />)}
              </div>
              <div>
                {item.taglist.map((tag, idx) => <Tag key={`taglist-${idx}`}>{tag}</Tag>)}
              </div>
            </div>
          )
        }
      />
    </List.Item>
  );

  return (
    <Spin spinning={loading} tip='加载中'>
      <List
        className='deliver-list'
        header={<AmapInput onPositionChange={handlePositionChange} />}
        dataSource={value || []}
        renderItem={renderItem}
      />
    </Spin>
  );
}

export default DeliverView;
