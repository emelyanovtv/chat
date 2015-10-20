import React, {Component, PropTypes} from 'react';
import AnonymEncryptField from '../anonym-encrypt-field';
import Expire from '../expire';
import {setEncryptString} from '../../actions/anonymus';
import {deleteChannelAnonym} from '../../actions/channels';
import './sidebar.sass';

class SidebarAnonym extends Component {
	static propTypes = {
		encrypted: PropTypes.bool,
		temporary: PropTypes.bool,
		current: PropTypes.string,
		expire: PropTypes.string,
		dispatch: PropTypes.func.isRequired
	}

	constructor(props) {
		super(props);
	}

	setEncryptString(string) {
		this.props.dispatch(setEncryptString(string));
	}

	deleteChannel() {
		this.props.dispatch(deleteChannelAnonym(this.props.current));
	}

	render() {
		const {encrypted, temporary, expire} = this.props;
		let encryptComponent = '';
		let expireComponent = '';
		if (encrypted) {
			encryptComponent = <AnonymEncryptField setEncrypt={::this.setEncryptString}/>;
		}
		if (temporary) {
			expireComponent = <Expire expire={expire} removeChannel={::this.deleteChannel}/>;
		}
		return (
			<aside className="sidebar">
				{expireComponent}
				{encryptComponent}
				<div className="anonim-info">
					You logged in like anonymus user
				</div>
			</aside>
		);
	}
}

export default SidebarAnonym;
