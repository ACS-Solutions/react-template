
import { createHashHistory } from 'history';
import DockMonitor from 'redux-devtools-dock-monitor';
import ReactDOM from 'react-dom';
import { Router } from 'react-router';
import { Provider } from 'react-redux';
import { combineReducers, compose, createStore } from 'redux';
import { createDevTools } from 'redux-devtools';
import LogMonitor from 'redux-devtools-log-monitor';
import { routeReducer, syncReduxAndRouter } from 'redux-simple-router';

import { State } from 'lib/State';
import RouteSet from 'app/Routes';
import AppGlobal from 'state/Global';


const jQuery = require( 'jquery' );
require( 'whatwg-fetch' );


jQuery(() => {
	jQuery(document).off( '.data-api' );
	const reducer = combineReducers({
		application: State.reducer( AppGlobal ),
		routing: routeReducer
	});
	const DevTools = createDevTools(
		<DockMonitor toggleVisibilityKey='ctrl-h' changePositionKey='ctrl-q'>
			<LogMonitor/>
		</DockMonitor>
	);
	const store = compose(
		DevTools.instrument()
	)( createStore )( reducer );
	const history = createHashHistory({ queryKey: false });
	syncReduxAndRouter( history, store );
	ReactDOM.render(
		<Provider store={ store }>
			<div>
				<DevTools/>
				<Router history={ history } routes={ RouteSet() }/>
			</div>
		</Provider>,
		jQuery( '.app' )[0],
		() => jQuery('.loader').remove()
	);
});
