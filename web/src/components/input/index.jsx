import React, {Component, PropTypes} from 'react';
import UserPic from '../user-pic';
import Speech from '../speech';
import UiError from '../ui-error';
import './input.sass';
import {encrypt} from '../../text-processor/process';

class Input extends Component {
	static propTypes = {
		addMessage: PropTypes.func,
		setError: PropTypes.func,
		removeError: PropTypes.func,
		channel: PropTypes.string,
		activeChannelId: PropTypes.string,
		user: PropTypes.object,
		encryptedMust: PropTypes.bool,
		encryptString: PropTypes.string
	}

	constructor() {
		super();
		this.state = {area: null};
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
		this.setState({area: this.refs.messageInput.getDOMNode()}); /* eslint react/no-did-mount-set-state: 0 */
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
		const {addMessage, setError, removeError, encryptedMust, encryptString, activeChannelId, user} = this.props;
		let error = false;
		if (text.length > 0) {
			if (encryptedMust) {
				const encryptStringTrimmed = (encryptString === null) ? '' : encryptString.toString().trim();
				if (encryptStringTrimmed.length === 0) {
					setError('submitMessage', 'encrypted string must be paste!');
					error = true;
				} else {
					text = encrypt(text, encryptStringTrimmed); /* eslint no-param-reassign: 0 */
				}
			}
			if (!error ) {
				removeError('submitMessage');
				addMessage('text', text, activeChannelId, user._id);
				elem.value = '';
			}
		} else {
			setError('submitMessage', 'You don write the message!');
		}
	}

	submitMessage(event) {
		event.preventDefault();
		event.stopPropagation();
		const elm = this.refs.messageInput.getDOMNode();
		const text = elm.value.trim();
		this.sendMess(text, elm);
	}

	render() {
		const {user: {avatar, color, isOnline = true}} = this.props;
		let speech = '';
		if ('webkitSpeechRecognition' in window) {
			speech = <Speech area={this.state.area}/>;
		}
		return (
			<div className="dialog-input">
				<UserPic
					online={isOnline}
					avatar={avatar}
					color={color}/>
				<textarea ref="messageInput" className="dialog-input__textarea"></textarea>
				<UiError classError="dialog-input__warning" nameError="submitMessage"/>
				<h4 className="dialog-input__record-button">{speech}</h4>
				<button onClick={this.submitMessage.bind(this)} className="dialog-input__send-button" type="submit">Send</button>
			</div>

		);
	}
}

export default Input;
