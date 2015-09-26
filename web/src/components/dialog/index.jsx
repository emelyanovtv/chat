import React, {Component, PropTypes} from 'react';
import DialogDetails from '../dialog-details';
import DialogMessage from '../dialog-message';
import './dialog.sass';

class Dialog extends Component {

	render() {
		return (
			<div className="dialog">
				<DialogDetails/>
					<ul className="messages-container">
						<DialogMessage/>
						<DialogMessage short="true"/>
					</ul>
			</div>
		);
	}
}

export default Dialog;
