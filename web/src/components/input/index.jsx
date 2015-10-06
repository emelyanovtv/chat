import React, {Component, PropTypes} from 'react';
import UserPic from '../user-pic';
import './input.sass';
import trim from 'lodash/string/trim';
class Input extends Component {
	static propTypes = {
		addMessage: PropTypes.func,
		channel: PropTypes.string,
		activeChannelId: PropTypes.string,
		user: PropTypes.object
	}

	componentDidMount() {
		this.refs.messageInput.getDOMNode().addEventListener('keyup', event => {
			if (event.keyCode === 13) {
				this.submitMessage(event);
			}
		});
	}

	submitMessage(event) {
		event.preventDefault();
		event.stopPropagation();

		const elm = this.refs.messageInput.getDOMNode();
		const text = trim(elm.value);
		if (text.length > 0) {
			const {addMessage, activeChannelId, user} = this.props;
			if (text) {
				addMessage('text', text, activeChannelId, user._id);
				elm.value = '';
			}
		}
	}

	render() {
		const {user: {avatar, color, isOnline = true}} = this.props;

		return (
			<div className="dialog-input">
				<UserPic
					online={isOnline}
					avatar={avatar}
					color={color}/>
				<textarea ref="messageInput" className="dialog-input__textarea"></textarea>
				<a className="dialog-input__add-button" href="#">+</a>
				<button onClick={this.submitMessage.bind(this)} className="dialog-input__send-button" type="submit">Send</button>
			</div>
		);
	}
}

export default Input;
