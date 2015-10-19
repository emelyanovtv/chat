import React from 'react';
import {Provider} from 'react-redux';
import createBrowserHistory from 'history/lib/createBrowserHistory';
import {Router, Route} from 'react-router';
import store from './store';
import App from './App';
import AppAnonym from './AppAnonym';
import Login from './components/login';
import Create from './components/create';
import Register from './components/register';
import WelcomePage from './components/welcome-page';

function renderRoutes() {
	return (
		<Router history={createBrowserHistory()}>
				<Route path="/" component={App} />
				<Route component={WelcomePage}>
					<Route path="/login" component={Login} />
					<Route path="/register" component={Register} />
					<Route path="/create" component={Create} />
					<Route path="/chat/:hash/" component={AppAnonym} />
				</Route>
		</Router>
	);
}

React.render(
	(
		<Provider store={store}>
			{() => renderRoutes()}
		</Provider>
	),
	document.getElementById('app'));
