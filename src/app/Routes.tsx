
import * as React from 'react';
import { Route, Router, IndexRoute, Redirect } from 'react-router';

import MainLayout from 'layout/Main';
import TodosPage from 'pages/Todos';

/**
Constructs a (react-router) model representing the routing hiararchy for the application.
*/
export default function RouteSet( history ) {
	return (
		<Router history={ history }>
			<Route path='/' component={ MainLayout }>
				<Route path='todo' component={ TodosPage }/>
			</Route>
		</Router>
	);
}
