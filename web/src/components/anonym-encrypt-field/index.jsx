import React, {Component, PropTypes} from 'react';
import './contactsearch.sass';

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
			<div className="contacts-filter">
				<input
					ref="input"
					className="contacts-filter__input"
					placeholder="add ecncrypt/decrypt value"
					type="text" />
				<span onClick={::this._setEncrypted} className="contacts-filter__close">Ok</span>
			</div>
		);
	}
}

export default AnonymEncryptField;
