import React, {Component, PropTypes} from 'react';
import AnonymEncryptField from '../anonym-encrypt-field';
import {setEncryptString} from '../../actions/anonymus';
import './sidebar.sass';

class SidebarAnonym extends Component {
	static propTypes = {
		encrypted: PropTypes.bool,
		dispatch: PropTypes.func.isRequired
	}

	constructor(props) {
		super(props);
	}

	setEncryptString(string) {
		this.props.dispatch(setEncryptString(string));
	}

	render() {
		let encryptString = '';
		if (this.props.encrypted) {
			encryptString = <AnonymEncryptField setEncrypt={::this.setEncryptString}/>;
		}
		return (
			<aside className="sidebar">
				{encryptString}
				<div className="anonim-info">
					You logged in like anonymus user
				</div>
			</aside>
		);
	}
}

export default SidebarAnonym;
