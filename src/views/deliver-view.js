/* eslint react/no-array-index-key: 1, promise/prefer-await-to-then: 1 */
import React, {memo, useCallback, useEffect, useState, useRef} from 'react';
import {Spin, List, Tag, Icon, AutoComplete, Input, Typography, message} from 'antd';
import debounce from 'lodash.debounce';
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

const AmapInput = ({onSelect}) => {
  const [state, setState] = useState({loading: false, data: []});

  const handleSearch = debounce(async keywords => {
    if (keywords.length >= 2) {
      setState(state => ({...state, loading: true}));
      const data = await amap.inputtips({keywords});
      if (data.status === '1') {
        setState(() => ({loading: false, data: data.tips}));
      } else if (data.info !== 'OK') {
        message.error(`amap: ${data.info} (${data.infocode})`);
        setState(state => ({...state, loading: false}));
      }
    }
  }, 1000);

  return (
    <AutoComplete
      style={{
        width: 350
      }}
      optionLabelProp='text'
      dataSource={state.data.map((item, index) => (
        <AutoComplete.Option key={`tips-${item.id}-${index}`} text={item.name} value={`${item.location}`}>
          <OptionContent item={item} />
        </AutoComplete.Option>
      ))}
      onSearch={handleSearch}
      onSelect={onSelect}
    >
      <Input placeholder='输入地址关键字' prefix={<Icon type={state.loading ? 'loading' : 'environment'} />} />
    </AutoComplete>
  );
};

function DeliverView() {
  const latestPosition = useRef();
  const [state, setState] = useState({loading: true, data: []});
  const [params, setParams] = useState({});

  const handleSelect = useCallback(value => {
    const values = value.split(',');
    if (values.length === 2) {
      const position = {longitude: values[0], latitude: values[1]};
      latestPosition.current = position;
      setParams(() => ({...position}));
    }
  }, []);

  // geolocation => (on) ? setPosition : (off) latestPostion ? setPosition : need custom address info.
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        latestPosition.current = position;
        setParams(() => ({position}));
      }, () => {
        if (latestPosition.current) {
          message.info('使用上次定位数据');
          setParams(params => ({...params, position: latestPosition.current}));
        } else {
          message.info('无法定位，请手动输入关键字搜索');
          setState(state => ({...state, loading: false}));
        }
      }, {timeout: 5000});
    } else {
      message.info('无法定位，请手动输入关键字搜索');
      setState(state => ({...state, loading: false}));
    }
  }, []);

  useEffect(() => {
    const {latitude, longitude} = params;

    setState(state => ({...state, loading: true}));
    if (latitude && longitude) {
      KuaidiService.deliver({latitude, longitude})
        .then(({data}) => {
          setState(() => ({loading: false, data}));
        }, error => {
          console.error(error);
        });
    }

    return () => {};
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
    <Spin spinning={state.loading} tip='加载中'>
      <List
        className='deliver-list'
        header={<AmapInput onSelect={handleSelect} />}
        dataSource={state.data}
        renderItem={renderItem}
      />
    </Spin>
  );
}

export default DeliverView;
