/* eslint react/no-array-index-key: 1 */
import React, {memo, useCallback, useEffect, useState, useRef} from 'react';
import {
  Spin,
  List,
  Tag,
  Icon,
  AutoComplete,
  Input,
  Typography,
  message
} from 'antd';
import debounce from 'lodash.debounce';
import {useAsync, useGeolocation} from '../hooks';
import TypeTag from '../components/type-tag';
import KuaidiService from '../services/kuaidi-service';
import * as amap from '../services/amap';

const {Text} = Typography;

const OptionContent = memo(({item}) => {
  return (
    <>
      <Text>{item.name}</Text>
      <br />
      <Text type='secondary'>
        {item.district} ({item.address})
      </Text>
    </>
  );
});

const AmapInput = ({onPositionChange = () => {}}) => {
  const latestPosition = useRef(null);
  const [state, set] = useState({loading: false, disabled: false, data: []});

  const setState = useCallback(value => {
    set(state => ({...state, ...value}));
  }, []);

  const dispatchPositionChanged = useCallback(
    ({latitude, longitude}) => {
      if (latitude && longitude) {
        latestPosition.current = {latitude, longitude};
        onPositionChange(latestPosition.current);
      }
    },
    [onPositionChange]
  );

  const handleSearch = debounce(async keywords => {
    if (keywords.length >= 2) {
      setState({loading: true});
      const data = await amap.inputtips({keywords});
      if (data.status === '1') {
        setState({loading: false, data: data.tips});
      } else {
        message.error(`amap: ${data.info} (${data.infocode})`);
        setState({loading: false, data: []});
      }
    }
  }, 1000);

  const handleSelect = value => {
    const values = value.split(',');
    if (values.length === 2) {
      const position = {longitude: values[0], latitude: values[1]};
      dispatchPositionChanged(position);
    }
  };

  const position = useGeolocation({timeout: 5000});

  useEffect(() => {
    const {longitude, latitude, error} = position;

    if (error) {
      if (latestPosition.current) {
        message.info('使用上次定位数据');
        dispatchPositionChanged(latestPosition.current);
      } else {
        message.info('无法定位，请手动输入关键字搜索');
      }
    } else {
      dispatchPositionChanged({longitude, latitude});
    }
  }, [position, dispatchPositionChanged]);

  return (
    <AutoComplete
      style={{
        width: 350
      }}
      disabled={position.loading}
      optionLabelProp='text'
      dataSource={state.data.map((item, index) => (
        <AutoComplete.Option
          key={`tips-${item.id}-${index}`}
          text={item.name}
          value={`${item.location}`}
        >
          <OptionContent item={item} />
        </AutoComplete.Option>
      ))}
      onSearch={handleSearch}
      onSelect={handleSelect}
    >
      <Input
        placeholder={position.loading ? '定位中' : '输入地址关键字'}
        prefix={
          <Icon
            type={position.loading || state.loading ? 'loading' : 'environment'}
          />
        }
      />
    </AutoComplete>
  );
};

function DeliverView() {
  // 查询所需的参数
  const [params, setParams] = useState({});
  const handlePositionChange = useCallback(position => {
    console.log(position);
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
        title={
          <span>
            {item.name || item.mktName} <Icon type='phone' /> {item.phone}
          </span>
        }
        description={
          <div>
            <span>{item.address}</span>
            <div>
              {item.comlist.map((tag, idx) => (
                <TypeTag key={`comlist-${idx}`} type={tag.kuaidiCom} />
              ))}
            </div>
            <div>
              {item.taglist.map((tag, idx) => (
                <Tag key={`taglist-${idx}`}>{tag}</Tag>
              ))}
            </div>
          </div>
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
