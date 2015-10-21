var manager = require('./../socket/manager');

exports.get = function(req, res, next) {
	var sid = req.session.id;
	var uid = req.user._id;
	var connectedSockets = manager.users.get(uid).sockets;

	req.session.reload(function(err) {
		delete req.session['passport'];

		connectedSockets.forEach(function(scoket, index) {
			if (scoket.handshake.session.id === sid) {
				scoket.emit('logout');
				scoket.disconnect();
				connectedSockets.splice(index, 1);
			}
			// удаление пользователя из глобального скопа если нет сокетов с другими сессиями
			if (connectedSockets.length === 0) {
				manager.users.remove(uid);
			}
		});
		req.session.save();

		if (err) {
			return next(err);
		}

		res.redirect('/login');
	});
};
