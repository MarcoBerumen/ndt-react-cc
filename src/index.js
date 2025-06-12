import React from 'react';
import { Provider } from 'react-redux';
import { createRoot } from 'react-dom/client';
import { createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk';
import reducers from './reducers';
import App from './components/App';
import './index.css';

let store = createStore(
  reducers,
  applyMiddleware(thunk)
);

const root = createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
