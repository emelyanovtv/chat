import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import cx from 'classnames';
import './ui-error.sass';

@connect(store => ({
	ui: store.ui
}))

class UiError extends Component {
	static propTypes = {
		classError: PropTypes.string,
		nameError: PropTypes.string,
		ui: PropTypes.object.isRequired
	}

	render() {
		const {classError, nameError, ui: {errors}} = this.props;
		const classErrorName = (classError) ? classError : 'ui-error__warning';
		const additional = (errors[nameError].additional !== null) ? '. ' + errors[nameError].additional : '';
		const mess = errors[nameError].message + additional;
		return (
			<p className={cx(classErrorName, {'hide': !errors[nameError].status})}>{mess}</p>
		);
	}
}

export default UiError;
