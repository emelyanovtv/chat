import React, {Component, PropTypes} from 'react';
import createHash from './helper';
import serialize from 'form-serialize';
import {sendFormData} from '../../utils/request';
import './index.sass';

class Create extends Component {
	static propTypes = {
		history: PropTypes.object
	};

	constructor() {
		super();
		this.options = [
			{name: 'none', value: 'none'},
			{name: '1 minute', value: 60},
			{name: '1 day', value: 86400},
			{name: '1 week', value: 604800}
		];
		this.state = {error: null, isEncrypted: 0, hash: createHash(), temporary: 'none'};
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
			<div className="create-form__error">{this.state.error}</div>
		);
	}

	renderOption(value, name) {
		return (
			<option value={value}>{name}</option>
		);
	}

	render() {
		const options = [];
		const _t = this;
		this.options.forEach(function(option) {
			options.push(_t.renderOption(option.value, option.name));
		});
		return (
			<form className="create-form" ref="form" onSubmit={::this.onSubmit} action="." method="POST">
				<div className="create-form__header">
					<h1>Create p2p chat</h1>
				</div>
				<div className="create-form__content">
					{this.state.error ? this.renderError() : ''}

					<p className="create-form__field">
						<label>Your hash</label>
						<input ref="hash" type="text" name="hash" value={this.state.hash}/>
					</p>
					<p className="create-form__field">
						<label>Is Encrypted</label>
						<input ref="isEncrypted" name="isEncrypted" type="checkbox" value="1" onChange={::this.handleChangeCheckbox}/>
					</p>
					<p className="create-form__field">
						<label>Temporary</label>
						<select onChange={::this.handleChange} name="temporary" ref="temporary">
							{options}
						</select>
					</p>
					<button className="create-form__submit" type="submit">Create</button>
				</div>
			</form>
		);
	}
}

export default Create;
