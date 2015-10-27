var mongooseMock = require('mongoose-mock'); // мока для монгуса
var	proxyquire = require('proxyquire');
var app = require('./../../server/server'); //передаю для supertest
var config = require('./../../server/config');

var serverUrl = 'http://localhost:3000';
var io = require('socket.io-client');
var socketio = require('socket.io')(app, {
	path: '/socket.io-client'
});
var manager = require('./../../server/socket/manager');
var middleware = require('./../../server/middleware/socket');
var sessionStore = require('./../../server/lib/database/sessionStore');
require('should');
describe('Client work with server', function() {
	var models = proxyquire('./../../server/models', { 'mongoose': mongooseMock });
	var request = require('supertest');
	var cookie;
	var user;
	var userTo;
	var sessionID;
	var client;
	var textMessage = 'trololo';
	var channel;
	var agent = request.agent(app);
	var DEFAULT_CHANNEL_ID = config.get('defaultChannel');

	before(function(done) {
		// первый пользователь, кторый будет залогинен
		var newUser = new models.User(
			{
				username: 'Fake',
				password: 'Fake123',
				email: 'Fake123@Fake123.com',
				color: '31b0c3',
				avatar: '/img/avatar-1.png'
			}
		);
		// второй пользователь, кторый будет добавлен в контакты
		var newUser2 = new models.User(
			{
				username: 'Fake2',
				password: 'Fake1232',
				email: 'Fake123@Fake1232.com',
				color: '31b0c3',
				avatar: '/img/avatar-1.png'
			}
		);
		newUser.save().then(function(userCreated) {
			user = userCreated;
			newUser2.save().then(function(userCreatedTo) {
				userTo = userCreatedTo;
				done();
			});
		});
	});

	after(function(done) {
		user.remove()
			.then(function() {
				return userTo.remove();
			})
			.then(function() {
				return models.Channel.findOne({ _id: channel });
			})
			.then(function(channelCreated) {
				if (!channelCreated) throw Error('Channel not created!');
				return channelCreated.remove();
			})
			.then(function() {
				return models.Message.find({ channelId: { $in: [channel] } }).remove();
			})
			.then(function() {
				return sessionStore.load(sessionID, function(err, session) {
					if (session !== undefined) {
						session.destroy();
					}
				});
			})
			.then(done);
	});

	it('POST login', function (done) {
		agent
			.post('/login')
			.send({username: 'Fake', password: 'Fake123'})
			.end(function (err, res) {
				res.should.have.property('statusCode', 302);
				cookie = res.headers['set-cookie'];
				done();
			});
	});

	it('should GET / (authorized) without redirect to login', function(done) {
		agent
			.get('/')
			.set('cookie', cookie)
			.end(function (err, res) {
				res.should.have.property('statusCode', 200);
				cookie = res.request.cookies;
				done();
			});
	});

	it('should create server behavior', function(done) {
		var userId;
		var userSock;
		socketio.use(function(socket, next) {
			socket.request.headers.cookie = cookie; // делаю намеренно для того, чтобы пользователь прошел проверку и соединение былло корректным
			next();
		});
		socketio.use(middleware.cookie);
		socketio.use(middleware.loadSession);
		socketio.use(middleware.loadUser);
		socketio.set('transports', ['websocket']);
		socketio.use(function(socket, next) {
			if (socket.handshake.user) {
				sessionID = socket.handshake.sessionID;
				userId = socket.handshake.user._id;
				userSock = manager.users.get(userId);
				if (userSock) {
					userSock.updateSockets();
					userSock.sockets.push(socket);
				} else {
					userSock = manager.users.create(userId, {
						userData: socket.handshake.user,
						socket: socket,
						channel: DEFAULT_CHANNEL_ID
					});
				}

				models.Channel
					.getContactsByUserID(userId, socket.handshake.user.anonymus)
					.then(function(contacts) {
						userSock.contacts = contacts;
						next();
					})
					.catch(next);
			}

			next(new Error('not fined!'));
		});

		socketio.on('connection', function socketConnectionHandler(socket) {
			require('./../../server/socket/types/user')(socket);
			require('./../../server/socket/types/channel')(socket);
			// генерирую событие списка комнат getContsctsList
			// Обработка пользовательских событий
		});
		done();
	});

	it('should connect login user to socket', function(done) {
		client = io(serverUrl, {
			path: '/socket.io-client',
			transports: ['websocket'],
			'force new connection': true
		});
		client.on('connect', function() {
			done();
		});
	});

	it('should add channel to user', function(done) {
		client.on('s.channel.add', function(data) {
			channel = data.channel;
			done();
		});
		client.emit('c.channel.add', {username: userTo.username});
	});

	it('should get user data', function(done) {
		client.on('s.user.set_data', function(data) {
			data.contacts[channel].user.should.equal(userTo._id.toString());
			done();
		});
		client.emit('c.user.get_data');
	});

	it('should change channel', function(done) {
		client.on('s.channel.join', function(data) {
			data.channel.should.equal(channel);
			done();
		});
		client.emit('c.channel.join', {id: channel});
	});

	it('should send message and recive', function(done) {
		var mess = {message_type: 'text', channelId: channel, text: textMessage, userId: user._id};
		client.on('s.user.send_message', function(data) {
			data.message.userId.should.equal(user._id.toString());
			data.message.message.should.equal(textMessage);
			done();
		});
		client.emit('c.user.send_message', mess);
	});

	it('should get messages by channel and pagenum', function(done) {
		client.on('s.user.message_by_room', function(data) {
			data.data[0].userId.should.equal(user._id.toString());
			data.data[0].message.should.equal(textMessage);
			data.data[0].channelId.should.equal(channel);
			done();
		});
		client.emit('c.user.get_message_by_room', {channelId: channel, page: 1});
	});

})
