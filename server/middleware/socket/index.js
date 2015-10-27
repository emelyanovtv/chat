var cookieParser = require('cookie-parser');
var models = require('../../models');
var config = require('../../config');
var expressCookieMiddleware = cookieParser(config.get('session:secret'));
var sessionStore = require('../../lib/database/sessionStore');

module.exports.cookie = function(socket, next) {
	expressCookieMiddleware(socket.request, null, next);
};

module.exports.loadSession = function loadSession(socket, next) {
	var sid = socket.request.signedCookies[config.get('session:key')];

	sessionStore.load(sid, function(err, session) {
		if (err) {
			next(err);
		}
		socket.handshake.session = session;
		socket.handshake.sessionID = sid;
		next();
	});
};

module.exports.loadUser = function loadUser(socket, next) {
	var userId = null;
	var isAnonym = false;
	var session = socket.handshake.session;
	if (!session) {
		next();
	}
	if (socket.handshake.query.query !== undefined && socket.handshake.query.query === 'anonymus') {
		isAnonym = true;
	}
	if (session.passport !== undefined && !isAnonym) {
		userId = session.passport.user.user_id;
		socket.handshake.channel = session.passport.user.channel;
	}
	if (session.anonymus !== undefined && isAnonym) {
		userId = session.anonymus.user_id;
		socket.handshake.channel = session.anonymus.channel;
	}

	if (!userId) {
		next();
	}

	models.User
		.findById(userId)
		.then(user => {
			socket.handshake.user = user.toObject();
			next();
		})
		.catch(next);
};
