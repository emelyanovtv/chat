import React, {Component, PropTypes} from 'react';
import createHash from './helper';
import serialize from 'form-serialize';
import {sendFormData} from '../../utils/request';
import cx from 'classnames';
import './index.sass';

class Create extends Component {
	static propTypes = {
		history: PropTypes.object
	};

	constructor() {
		super();
		this.state = {error: null, isEncrypted: 0, hash: createHash()};
	}

	onSubmit(event) {
		event.preventDefault();
		sendFormData('/create', serialize(this.refs.form.getDOMNode()))
			.then(result => {
				const res = JSON.parse(result);
				if (res.error) {
					this.setState({error: res.error});
				} else {
					window.location.href = '/chat/' + this.state.hash + '/';
				}
			})
			.catch(err => {
				this.setState({error: err});
			});
	}


	handleChangeCheckbox() {
		this.state.isEncrypted = !this.state.isEncrypted;
		this.setState(this.state);
	}

	handleChange(event) {
		const retObject = this.state;
		retObject[event.target.name] = event.target.value;
		this.setState(retObject);
	}

	renderError() {
		return (
			<div className="login-form__error">{this.state.error}</div>
		);
	}

	render() {
		return (
			<form className="login-form" ref="form" onSubmit={::this.onSubmit} action="." method="POST">
				<div className="login-form__header">
					<h1>Create p2p chat</h1>
				</div>
				<div className="login-form__content">
					{this.state.error ? this.renderError() : ''}

					<p className="login-form__field">
						<label>Your hash</label>
						<input ref="hash" type="text" name="hash" value={this.state.hash}/>
					</p>
					<p className="login-form__field">
						<label>Is Encrypted</label>
						<input ref="isEncrypted" name="isEncrypted" type="checkbox" value="1" onChange={::this.handleChangeCheckbox}/>
					</p>

					<button className="login-form__submit" type="submit">Create</button>
				</div>
			</form>
		);
	}
}

export default Create;
