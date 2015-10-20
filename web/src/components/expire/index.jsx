import React, {Component, PropTypes} from 'react';
import moment from 'moment';
import './expire.sass';

class Expire extends Component {

	static propTypes = {
		expire: PropTypes.string,
		removeChannel: PropTypes.func.isRequired
	}

	constructor(props) {
		super(props);
		this.date = parseInt((+new Date) / 1000, 10);
		this.state = {timeLeft: 'calculating....'};
		this.timer = null;
	}

	componentDidMount() {
		// componentDidMount вызывается react'ом, когда компонент
		// был отрисован на странице. Мы можем установить интервал здесь:
		this.timer = setInterval(this.setTimeleft.bind(this), 1000);
	}

	componentWillUnmount() {
		// Этот метод вызывается сразу после того, как компонент удален
		// со страницы и уничтожен. Мы можем удалить интервал здесь:
		clearInterval(this.timer);
	}

	setTimeleft() {
		let timeleftString = '';
		if (!this.expire) {
			this.expire = this.props.expire;
		}
		this.expire--;
		const timeLeft = parseInt(this.expire, 10) - this.date;
		if (timeLeft === 0) {
			this.props.removeChannel();
			clearInterval(this.timer);
			window.location.href = '/create';
		}
		const duration = moment.duration(timeLeft * 1000, 'milliseconds');
		if ( duration.days() > 0) {
			timeleftString += duration.days() + ' day(s), ';
		}
		timeleftString += duration.hours() + ':' + duration.minutes() + ':' + duration.seconds();
		this.setState({timeLeft: timeleftString});
	}

	render() {
		return (
			<div className="expire">Time remaining: {this.state.timeLeft}</div>
		);
	}
}

export default Expire;
