import React from 'react';
import {render} from 'react-dom';
import {createStore, applyMiddleware} from 'redux';
import {Provider} from 'react-redux';
import thunkMiddleware from 'redux-thunk';
import logger from 'redux-logger';
import {document, window} from 'global';

import AppContainer from './src/containers/container';
import reducer from './src/reducer';
import 'antd/dist/antd.css';

const store = createStore(
  reducer,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
  applyMiddleware(thunkMiddleware, logger)
);

render(
  <Provider store={store}>
    <AppContainer />
  </Provider>,
  document.getElementById('root')
);
