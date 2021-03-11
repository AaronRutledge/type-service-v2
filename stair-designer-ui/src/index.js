import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, compose } from 'redux';
import rootReducer from './reducers/rootReducer';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import { sampleLevels, samplePlanLevels, initialState } from './Util/constants';
import _includes from 'lodash/includes';

const store = createStore(rootReducer, initialState, compose(window.devToolsExtension ? window.devToolsExtension() : f => f))
if (_includes(window.location.toString(), '?test')) {
    var r = (new Date()).getTime().toString(16) +
        Math.random().toString(16).substring(2) + "0".repeat(16);
    var guid = r.substr(0, 8) + '-' + r.substr(8, 4) + '-4000-8' +
        r.substr(12, 3) + '-' + r.substr(15, 12);
    window.UiBrowserState = {
        levels: JSON.stringify(sampleLevels),
        planLevels: JSON.stringify(samplePlanLevels),
        projectGuid: guid
    };
}

ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('root')
);

registerServiceWorker();
