import React, {Component, PropTypes} from 'react';
import './index.sass';

class Header extends Component {

	static propTypes = {
		registered: PropTypes.string
	}
s
	render() {
		let Logout = '';
		if (this.props.registered === 'true') {
			Logout = <a className="header__logout-link" href="/logout">Logout</a>;
		}
		return (
			<header className="header">
				<a className="header__logo" href="#">Vanilla js</a>
				{Logout}
			</header>
		);
	}
}

export default Header;
