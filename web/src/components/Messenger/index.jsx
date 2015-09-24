import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {addMessage} from '../../actions/messages';
import MessageBox from '../MessageBox';
import Message from '../Message';
import './messenger.sass';

@connect(store => ({
	messages: store.messages,
	channels: store.channels,
	user: store.user,
}))

class Messenger extends Component {
	static propTypes = {
		messages: PropTypes.arrayOf(PropTypes.object),
		user: PropTypes.object,
		rooms: PropTypes.object,
	}

	constructor(props) {
		super(props);
		this.onMessage = this.onMessage.bind(this);
	}

	componentDidUpdate() {
		const container = this.refs.messageContainer.getDOMNode();
		container.scrollTop = container.scrollHeight;
	}

	onMessage(message) {
		const {dispatch, channels} = this.props;
		dispatch(addMessage('text', message, channels.current));
	}

	render() {
		const {messages} = this.props;
		return (
			<div className="messanger">
				<div ref="messageContainer" className="messanger__content">
				{messages.map((message, i) => {
					return (
						<Message key={i} message={message} />
					);
				})}
				</div>
				<MessageBox avatar={this.props.user.avatar} onMessage={this.onMessage} />
			</div>
		);
	}
}

export default Messenger;