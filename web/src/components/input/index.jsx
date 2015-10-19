import React, {Component, PropTypes} from 'react';
import UserPic from '../user-pic';
import './input.sass';
import {encrypt} from '../../text-processor/process';

class Input extends Component {
	static propTypes = {
		addMessage: PropTypes.func,
		channel: PropTypes.string,
		activeChannelId: PropTypes.string,
		user: PropTypes.object,
		encryptedMust: PropTypes.bool,
		encryptString: PropTypes.string
	}

	componentDidMount() {
		this.refs.messageInput.getDOMNode().addEventListener('keydown', event => {
			if (event.keyCode === 13) {
				if (event.ctrlKey || event.metaKey) {
					this.insertNewline(event);
				} else {
					this.submitMessage(event);
				}
			}
		});
	}

	insertNewline(event) {
		event.preventDefault();
		event.stopPropagation();

		const elm = this.refs.messageInput.getDOMNode();
		const value = elm.value;
		const start = elm.selectionStart;
		elm.value = `${value.slice(0, start)}\n${value.slice(elm.selectionEnd)}`;
		elm.selectionStart = elm.selectionEnd = start + 1;
	}

	sendMess(text, elem) {
		if (text.length > 0) {
			const {addMessage, activeChannelId, user} = this.props;
			addMessage('text', text, activeChannelId, user._id);
			elem.value = '';
		}
	}

	submitMessage(event) {
		event.preventDefault();
		event.stopPropagation();

		const elm = this.refs.messageInput.getDOMNode();
		const text = elm.value.trim();
		const encryptString = (this.props.encryptString === null) ? '' : this.props.encryptString.toString().trim();
		if (this.props.encryptedMust) {
			if (encryptString.length === 0) {
				alert('Encrypted chat must have encrypt string!');
			} else {
				this.sendMess(encrypt(text, this.props.encryptString), elm);
			}
		} else {
			this.sendMess(text, elm);
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
