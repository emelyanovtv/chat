import React, {Component, PropTypes} from 'react';
import './dialog-details.sass';

class DialogDetails extends Component {

  render() {
    return (
      <div className="dialog-details">
        <div className="dialog-details__contact">
          <p className="dialog-details__name">Vladimir Putin</p>
          <p className="dialog-details__status dialog-details__status--online">
            <span className="dialog-details__status-icon dialog-details__status-icon--online"></span>
            online
          </p>
        </div>
          <a className="dialog-details__menu" href="#">Menu</a>
      </div>
    );
  }
}

export default DialogDetails;
