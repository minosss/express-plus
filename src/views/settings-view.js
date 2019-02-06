import React, {useCallback} from 'react';
import {useDispatch, useMappedState} from 'redux-react-hook';
import {List, Switch, Select} from 'antd';
import {UPDATE_SETTINGS} from '../store/actions';

export default function SettingsView() {
  const mapState = useCallback(state => ({
    settings: state.settings
  }), []);
  const {settings} = useMappedState(mapState);

  const dispatch = useDispatch();
  const handleUpdateSetting = useCallback(name => value => dispatch({
    type: UPDATE_SETTINGS,
    settings: {
      [name]: value
    }
  }), []);

  return (
    <List
      className='setting-list'
      header='如果觉得这个插件还蛮好用的，可以到商店给个星星'
      footer='©2015-2019 快递助手 - 由快递100强力驱动'
    >
      <List.Item
        actions={[
          <Switch
            key='enableAuto'
            defaultChecked={settings.enableAuto}
            onChange={handleUpdateSetting('enableAuto')}
          />
        ]}
      >
        <List.Item.Meta
          title='开启自动查询'
          description='默认开启，勾选后会间隔一段时间后台查询未签收的快递。'
        />
      </List.Item>
      <List.Item
        actions={[
          <Select
            key='autoInterval'
            disabled={!settings.enableAuto}
            defaultValue={settings.autoInterval}
            onChange={handleUpdateSetting('autoInterval')}
          >
            <Select.Option value={30}>30</Select.Option>
            <Select.Option value={60}>60</Select.Option>
            <Select.Option value={120}>120</Select.Option>
          </Select>
        ]}
      >
        <List.Item.Meta
          title='自动查询间隔（分钟）'
          description='默认30分钟，间隔尽量不要太快，避免接口请求太频繁。'
        />
      </List.Item>
      <List.Item
        actions={[
          <Switch
            key='enableFilterDelivered'
            defaultChecked={settings.enableFilterDelivered}
            onChange={handleUpdateSetting('enableFilterDelivered')}
          />
        ]}
      >
        <List.Item.Meta
          title='只提示已签收快递'
          description='默认开启，勾选后只有在快递状态为签收后才提示信息。'
        />
      </List.Item>
    </List>
  );
}
