import React, {Component, PropTypes} from 'react';
import UserPic from '../user-pic';
import './dialog-message.sass';


class DialogMessage extends Component {

  renderShort() {
    return (
      <li className="dialog-message dialog-message--short">
        <div className="dialog-message__content">
          <p className="dialog-message__text">Lorem ipsum dolor sit amet, consectetur adipisicing elit.</p>
        </div>
        <time className="dialog-message__time">13:13</time>
      </li>
    )
  }

  renderFull() {
    return (
      <li className="dialog-message dialog-message--long">
        <div className="dialog-message ">
          <UserPic/>
          <div className="dialog-message__content">
            <p className="dialog-message__sender">Vladimir Putin</p>
            <p className="dialog-message__text">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Faciendum, sol sicine menandro dixerit recusabo optime defendit illius vocet accedit, dictum finxerat nostro malorum temeritate democritea deseruisse rationibus timentis. Loca graecum primo comparat.</p>
          </div>
          <time className="dialog-message__time">13:10</time>
        </div>
      </li>
    )
  }

  render() {
    const message = this.props.short ? this.renderShort() : this.renderFull();
    return (
      <ul className="messages-container">
        {message}
      </ul>
    );
  }
}

export default DialogMessage;