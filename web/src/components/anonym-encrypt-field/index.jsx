import React, {Component, PropTypes} from 'react';
import './anonymencrypt.sass';

class AnonymEncryptField extends Component {

	static propTypes = {
		encrypted: PropTypes.bool,
		setEncrypt: PropTypes.func.isRequired
	}

	constructor(props) {
		super(props);
		this.state = {isEmpty: true};
	}

	_setEncrypted() {
		const input = this.refs.input.getDOMNode();
		this.props.setEncrypt(input.value);
	}

	render() {
		return (
			<div className="anonym-hash">
				<input
					ref="input"
					className="anonym-hash__input"
					placeholder="add ecncrypt/decrypt string"
					type="text" />
				<span onClick={::this._setEncrypted} className="anonym-hash__close">Ok</span>
			</div>
		);
	}
}

export default AnonymEncryptField;
