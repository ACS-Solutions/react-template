
import createHistory from 'history/lib/createHashHistory';
import { useQueries } from 'history';
import DockMonitor from 'redux-devtools-dock-monitor';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { hashHistory, Router } from 'react-router';
import { routerReducer, syncHistoryWithStore } from 'react-router-redux';
import { combineReducers, compose, createStore } from 'redux';
import { createDevTools } from 'redux-devtools';
import LogMonitor from 'redux-devtools-log-monitor';

import { State } from 'lib/State';
import RouteSet from 'app/Routes';
import AppRoot from 'state/Root';


const jQuery = require( 'jquery' );
require( 'whatwg-fetch' );


jQuery(() => {
	jQuery(document).off( '.data-api' );
	// compile root reducer to match shape of app/StoreRoot
	const reducer = combineReducers({
		app: State.reducer( AppRoot ),
		routing: routerReducer
	});
	// redux dev tools
	const DevTools = createDevTools(
		<DockMonitor toggleVisibilityKey='ctrl-h' changePositionKey='ctrl-q'>
			<LogMonitor/>
		</DockMonitor>
	);
	// redux store
	const store = compose(
		DevTools.instrument()
	)( createStore )( reducer );
	// routing
	const history = syncHistoryWithStore( useQueries( createHistory )({ queryKey: false }), store );
	ReactDOM.render(
		<Provider store={ store }>
			<div>
				<DevTools/>
				{ RouteSet( history ) }
			</div>
		</Provider>,
		jQuery( '.app' )[0],
		() => jQuery('.loader').remove()
	);
});
