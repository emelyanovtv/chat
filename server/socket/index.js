var config = require('./../config');
var middleware = require('../middleware/socket');
var models = require('../models');
var manager = require('./manager');
var DEFAULT_CHANNEL_ID = config.get('defaultChannel');

module.exports = function(server) {
	var io = require('socket.io').listen(server);

	io.set('origins', config.get('app:socketOrigin'));
	io.use(middleware.cookie);
	io.use(middleware.loadSession);
	io.use(middleware.loadUser);

	io.use(function(socket, next) {
		var userId = socket.handshake.user._id;
		var user = manager.users.get(userId);
		var channel = socket.handshake.channel;
		if (user) {
			user.updateSockets();
			user.sockets.push(socket);
		} else {
			user = manager.users.create(userId, {
				userData: socket.handshake.user,
				socket: socket,
				channel: channel || DEFAULT_CHANNEL_ID
			});
		}
		// is anonym
		models.Channel
			.getContactsByUserID(userId, socket.handshake.user.anonymus)
			.then(function(contacts) {
				user.contacts = contacts;
				if (!user.contacts.hasOwnProperty(channel)) {
					user.channel = DEFAULT_CHANNEL_ID;
				}
				next();
			})
			.catch(next);
	});

	io.on('connection', function socketConnectionHandler(socket) {
		require('./types/user')(socket);
		require('./types/channel')(socket);
		// генерирую событие списка комнат getContsctsList
		// Обработка пользовательских событий
	});

	return io;
};
