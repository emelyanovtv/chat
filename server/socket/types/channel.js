var Handler = require('./handler/channel');
var manager = require('../manager');
var testing = (process.env.TEST === 'TRUE') ? true : false;
module.exports = function(socket) {
	var channel = manager.users.getById(socket.handshake.user._id).channel;

	manager.sendStatus('s.channel.online', socket.handshake.user._id);
	if (!testing) {
		socket.join(channel);
		socket.emit('s.channel.join', {channel});
	}

	(new Handler(socket)).bindSocketEvents();
};
