import React, {useState, useCallback} from 'react';
import {Icon, Input, Tooltip, AutoComplete, Dropdown, Menu, message} from 'antd';
import {Link} from 'react-router-dom';
import debounce from 'lodash.debounce';
import KuaidiService from '../../services/kuaidi-service';

function getStoreUri() {
  try {
    // eslint-disable-next-line no-useless-escape
    if (/(firefox)\/v?([\w\.]+)/i.test(window.navigator.userAgent)) {
      return 'https://addons.mozilla.org/en-US/firefox/addon/express-plus/';
    }
  } catch (_) {
  }

  return 'https://chrome.google.com/webstore/detail/hghlokkgbicmblinhepcibacaiegldeg';
}

const menu = (
  <Menu>
    <Menu.Item key='0'>
      <Link to='/'>
        <Icon type='inbox' /> 收藏列表
      </Link>
    </Menu.Item>
    <Menu.Item key='1'>
      <Link to='/settings'>
        <Icon type='setting' /> 设置
      </Link>
    </Menu.Item>
    <Menu.Item key='2'>
      <a
        href='https://github.com/minosss/express-plus/issues'
        target='_blank'
        rel='noopener noreferrer'
      >
        <Icon type='github' /> 去 Github 报错
      </a>
    </Menu.Item>
    <Menu.Item key='3'>
      <a
        href={getStoreUri()}
        target='_blank'
        rel='noopener noreferrer'
      >
        <Icon type='smile' /> 去商店评价
      </a>
    </Menu.Item>
  </Menu>
);

function renderOption(item, index) {
  return (
    <AutoComplete.Option
      key={`${item.postId}-${item.comCode}-${index}`}
      text={item.postId}
    >
      <Link to={`/detail/${item.postId}/${item.comCode}`}>
        <div className='auto-option'>
          <div className='auto-postid'>{item.postId}</div>
          <div className='auto-type'>
            {KuaidiService.getCompanyName(item.comCode)}
          </div>
        </div>
      </Link>
    </AutoComplete.Option>
  );
}

// TODO 将历史和识别选项分组
export default function AppHeader() {
  const [dataSource, setDataSrouce] = useState([]);

  const handleSearch = useCallback(debounce(async value => {
    if (String(value).length < 6) {
      return;
    }

    try {
      let data = await KuaidiService.auto(value);
      data =
        data && data.length > 0 ?
          data.map(item => ({...item, postId: value})).slice(0, 3) :
          [];
      setDataSrouce(data);
    } catch (error) {
      message.error(error.message);
      setDataSrouce([]);
    }
  }, 200), []);

  return (
    <div className='app-header'>
      <div className='start'>
        <Link to='/' style={{color: 'inherit'}}>
          Express+
        </Link>
      </div>
      <div className='end'>
        <AutoComplete
          optionLabelProp='text'
          dataSource={dataSource.map(renderOption)}
          onSearch={handleSearch}
        >
          <Input placeholder='输入快递单号' prefix={<Icon type='search' />} />
        </AutoComplete>
        <Tooltip title='菜单'>
          <Dropdown overlay={menu} trigger={['click']}>
            <a href='#' className='action'>
              <Icon type='menu' />
            </a>
          </Dropdown>
        </Tooltip>
      </div>
    </div>
  );
}
