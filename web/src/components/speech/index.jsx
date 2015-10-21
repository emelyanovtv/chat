import React, {Component, PropTypes} from 'react';
import cx from 'classnames';
import './speech.sass';

class Speech extends Component {
	static propTypes = {
		area: PropTypes.object
	}

	constructor() {
		super();

		const recognition = new webkitSpeechRecognition(); /* eslint new-cap: 0 */
		recognition.continuous = true;
		recognition.interimResults = true;
		this.interimTranscript = '';
		this.finalTranscript = '';
		this.state = {recognition: recognition, recognizing: false};
	}

	componentDidMount() {
		this.bindEvents();
	}

	onstart() {
		this.state.recognizing = true;
		this.setState(this.state);
	}

	onresult(event) {
		for (let i = event.resultIndex; i < event.results.length; ++i) {
			if (event.results[i].isFinal) {
				this.finalTranscript += event.results[i][0].transcript;
			} else {
				this.interimTranscript += event.results[i][0].transcript;
				this.props.area.value = this.interimTranscript;
			}
		}
		this.props.area.value = this.finalTranscript;
	}

	bindEvents() {
		this.state.recognition.onstart = this.onstart.bind(this);
		this.state.recognition.onresult = this.onresult.bind(this);
	}

	handleButton() {
		if (this.state.recognizing) {
			this.state.recognition.stop();
			this.state.recognizing = false;
			this.interimTranscript = '';
			this.finalTranscript = '';
			this.setState(this.state);
			return;
		}
		this.state.recognition.lang = 'ru';
		this.state.recognition.start();
	}

	render() {
		return (
			<i className={cx({'speech': true, 'speech--record': this.state.recognizing, 'fa fa-microphone': true})} onClick={::this.handleButton}></i>
		);
	}
}

export default Speech;
