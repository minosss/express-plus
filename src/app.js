import React from 'react';
import {HashRouter as Router, Route, Switch, Link} from 'react-router-dom';
import {Layout, Empty, message, LocaleProvider} from 'antd';
import zh from 'antd/lib/locale-provider/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import relativeTime from 'dayjs/plugin/relativeTime';
import AppHeader from './components/app-header';
import FavoritesView from './views/favorites-view';
import DetailView from './views/detail-view';
import SettingView from './views/settings-view';
import TypeOptionsView from './views/type-options-view';
import HistoryView from './views/history-view';
import DeliverView from './views/deliver-view';

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
      <LocaleProvider locale={zh}>
        <Layout className='has-fixed-header'>
          <Header className='has-shadow'>
            <AppHeader />
          </Header>
          <Content>
            <Switch>
              <Route exact path='/' component={FavoritesView} />
              <Route exact path='/settings' component={SettingView} />
              <Route exact path='/detail' component={DetailView} />
              <Route exact path='/select/:postId' component={TypeOptionsView} />
              <Route exact path='/history' component={HistoryView} />
              <Route exact path='/deliver' component={DeliverView} />
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
      </LocaleProvider>
    </Router>
  );
}

export default App;
