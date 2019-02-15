import React from 'react';
import {HashRouter as Router, Route, Switch, Link} from 'react-router-dom';
import {Layout, Empty, message} from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import relativeTime from 'dayjs/plugin/relativeTime';
import AppHeader from './components/app-header';
import FavoritesView from './views/favorites-view';
import DetailView from './views/detail-view';
import SettingView from './views/settings-view';
import TypeOptionsView from './views/type-options-view';
import HistoryView from './views/history-view';

dayjs.locale('zh-cn');
dayjs.extend(relativeTime);

message.config({
  top: 288,
  maxCount: 1,
  duration: 2
});

const {Content, Header} = Layout;

function App() {
  return (
    <Router>
      <Layout className='has-fixed-header'>
        <Header className='has-shadow'>
          <AppHeader />
        </Header>
        <Content>
          <Switch>
            <Route
              exact
              path='/'
              component={FavoritesView}
            />
            <Route
              exact
              path='/settings'
              component={SettingView}
            />
            <Route
              path='/detail/:postId/:type'
              component={DetailView}
            />
            <Route
              path='/select/:postId'
              component={TypeOptionsView}
            />
            <Route
              path='/history'
              component={HistoryView}
            />
            <Route
              render={() => (
                <Empty>
                  <Link to='/'>去收藏列表</Link>
                </Empty>
              )}
            />
          </Switch>
        </Content>
      </Layout>
    </Router>
  );
}

export default App;
