import React, {Component, PropTypes} from 'react';
import transport from './socket';
import store from './store';
import Header from './components/header';
import SidebarAnonym from './components/sidebar-anonym';
import Main from './components/main';
import {fetchUserData} from './actions/user';
import {connect} from 'react-redux';
import './components/page.sass';

@connect(store => ({
	channels: store.channels
}))

class AppAnonym extends Component {
	static propTypes = {
		channels: PropTypes.object.isRequired,
		dispatch: PropTypes.func.isRequired
	}

	componentWillMount() {
		transport.init({query: 'anonymus'});
		store.dispatch(fetchUserData());
	}

	render() {
		const {channels} = this.props;
		let isEncrypted = false;
		if (channels.contacts && channels.current !== null) {
			if (channels.contacts[channels.current] !== undefined) {
				isEncrypted = channels.contacts[channels.current].encrypted;
			}
		}
		return (
			<div className="chat">
				<Header registered="false"/>
				<SidebarAnonym dispatch={this.props.dispatch} encrypted={isEncrypted}/>
				<Main/>
			</div>
		);
	}
}

export default AppAnonym;
