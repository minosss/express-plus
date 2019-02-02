import React from 'react';
import {hot} from 'react-hot-loader';
import {HashRouter as Router, Route, Switch, Link} from 'react-router-dom';
import {Layout, Empty} from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import relativeTime from 'dayjs/plugin/relativeTime';
import AppHeader from './components/app-header';
import FavoritesView from './views/favorites-view';
import DetailView from './views/detail-view';
import SettingView from './views/settings-view';
import useAsyncReducer from './hooks/reducer';
import reducer from './reducers';

dayjs.locale('zh-cn');
dayjs.extend(relativeTime);

const {Content, Header} = Layout;

export const StateContext = React.createContext(null);

function App({initialState = {}, platformMiddlewares = []}) {
  const [state, dispatch] = useAsyncReducer(
    reducer,
    initialState,
    platformMiddlewares
  );

  return (
    <Router>
      <StateContext.Provider value={dispatch}>
        <Layout className='has-fixed-header'>
          <Header className='has-shadow'>
            <AppHeader />
          </Header>
          <Content>
            <Switch>
              <Route
                path='/'
                exact
                render={props => (
                  <FavoritesView favorites={state.favorites} {...props} />
                )}
              />
              <Route
                path='/settings'
                exact
                render={props => (
                  <SettingView settings={state.settings} {...props} />
                )}
              />
              <Route
                path='/detail/:postId/:type'
                render={props => {
                  const {favorites = []} = state;
                  const {postId} = props.match.params;
                  const defaultData = favorites.find(
                    ff => ff.postId === postId
                  );
                  return <DetailView {...props} defaultData={defaultData} />;
                }}
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
      </StateContext.Provider>
    </Router>
  );
}

export default hot(module)(App);
