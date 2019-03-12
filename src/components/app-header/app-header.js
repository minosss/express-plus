import React, {useState, useCallback} from 'react';
import {Icon, Input, Tooltip, AutoComplete, Dropdown, Menu, message} from 'antd';
import {Link} from 'react-router-dom';
import debounce from 'lodash.debounce';
import KuaidiService from '../../services/kuaidi-service';
import {reportIssue} from '../../utils';

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
    <Menu.Item key='favorite'>
      <Link to='/'>
        <Icon type='inbox' /> 收藏列表
      </Link>
    </Menu.Item>
    <Menu.Item key='history'>
      <Link to='/history'>
        <Icon type='clock-circle' /> 查询记录
      </Link>
    </Menu.Item>
    <Menu.Item key='deliver'>
      <Link to='/deliver'>
        <Icon type='team' /> 寄快递
      </Link>
    </Menu.Item>
    <Menu.Item key='setting'>
      <Link to='/settings'>
        <Icon type='setting' /> 设置
      </Link>
    </Menu.Item>
    <Menu.Item key='github'>
      <a
        target='_blank'
        rel='noopener noreferrer'
        onClick={reportIssue}
      >
        <Icon type='github' /> 去 Github 报错 <Icon type='export' />
      </a>
    </Menu.Item>
    <Menu.Item key='store'>
      <a
        href={getStoreUri()}
        target='_blank'
        rel='noopener noreferrer'
      >
        <Icon type='smile' /> 去商店评价 <Icon type='export' />
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
      <Link
        to={{
          pathname: '/detail',
          search: `?postId=${item.postId}&type=${item.comCode}`
        }}
      >
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

    let data = [];
    try {
      data = await KuaidiService.auto(value);
      data =
        data && data.length > 0 ?
          data.map(item => ({...item, postId: value})).slice(0, 3) :
          [];
    } catch (error) {
      message.error(error.message);
    }

    if (data.length > 0) {
      setDataSrouce(data.map(renderOption));
    } else {
      setDataSrouce([(
        <AutoComplete.Option key='push-to-type-options' text={value}>
          <Link to={`/select/${value}`}>
            去选择快递
          </Link>
        </AutoComplete.Option>
      )]);
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
          dataSource={dataSource}
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
