import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {addMessage, fetchChannelMessages} from '../../actions/messages';
import {deactivateVideoPanel, setError, removeError} from '../../actions/ui';
import Dialog from '../dialog';
import VideoPanel from '../video-panel';
import Input from '../input';
import './main.sass';

@connect(store => ({
	messages: store.messages,
	channels: store.channels,
	user: store.user,
	ui: store.ui,
	anonym: store.anonym
}))

class Main extends Component {
	static propTypes = {
		dispatch: PropTypes.func,
		channels: PropTypes.object,
		messages: PropTypes.object,
		user: PropTypes.object,
		ui: PropTypes.object,
		anonym: PropTypes.object
	}

	render() {
		const {dispatch, user, channels, messages, ui, anonym} = this.props;
		const boundActions = bindActionCreators({addMessage, setError, removeError}, dispatch);
		let encrypted = false;
		if (channels.current !== null && channels.contacts[channels.current] !== undefined) {
			encrypted = channels.contacts[channels.current].encrypted;
		}

		return (
			<main className="main">
				<Dialog
						user={user}
						channels={channels}
						messages={messages}
						encryptedMust={encrypted}
						encryptString={anonym.encryptString}
						{...bindActionCreators({fetchChannelMessages}, dispatch)} />
				<Input
						activeChannelId={this.props.channels.current}
						encryptedMust={encrypted}
						encryptString={anonym.encryptString}
						user={user}
						{...boundActions} />
				{ui.videoPanel.active ?
					<VideoPanel
						local={ui.videoPanel.localStream}
						remote={ui.videoPanel.remoteStream}
						{...bindActionCreators({deactivateVideoPanel}, dispatch)} /> : ''}
			</main>
		);
	}
}

export default Main;
