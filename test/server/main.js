var mongooseMock = require('mongoose-mock'); // мока для монгуса
var	proxyquire = require('proxyquire');
var app = require('./../../server/server'); // переменная сервреа для supertest
var config = require('./../../server/config');
var manager = require('./../../server/socket/manager');
var middleware = require('./../../server/middleware/socket');
var sessionStore = require('./../../server/lib/database/sessionStore');
require('should');
describe('Client work with server', function() {
	var eventsCall = {
		ADD_CHANNEL: {
			client: 'c.channel.add',
			server: 's.channel.add',
			error: 's.server.error.c.channel.add'
		},
		GET_DATA: {
			client: 'c.user.get_data',
			server: 's.user.set_data',
			error: 's.server.error.c.user.get_data'
		},
		JOIN_CHANNEL: {
			client: 'c.channel.join',
			server: 's.channel.join',
			error: 's.server.error.c.channel.join'
		},
		SEND_MESSAGE: {
			client: 'c.user.send_message',
			server: 's.user.send_message',
			error: 's.server.error.c.user.send_message'
		},
		GET_MESSAGE: {
			client: 'c.user.get_message_by_room',
			server: 's.user.message_by_room',
			error: 's.server.error.c.user.get_message_by_room'
		}

	};
	var serverUrl = 'http://localhost:3000'; // урл к которому будет подключатся созданный пользователь по сокету

	/**
	 * Новый сокет-сервер
	 * к которому будет подключаться пользователь
	 */
	var socketio = require('socket.io')(app, {
		path: '/socket.io-client'
	});

	/**
	 * Создание объекта с помощью которого
	 * пользователь будет подключаться
	 */
	var io = require('socket.io-client');

	/**
	 * Глобально доступные модели (замоканные)
	 */
	var models = proxyquire('./../../server/models', { 'mongoose': mongooseMock });

	/**
	 * supertest - библтотека для тестирования HTTP сервера
	 * в нашем случае логина
	 */
	var request = require('supertest');

	/**
	 * глобальлная переменная, устанавливается при авторизации
	 * для того , чтобы потом пердать в socket.request.headers.cookie
	 * для проверки middleware
	 */
	var cookie;

	/**
	 * Объект который инициализируется при создании пользователя
	 * который и будет логиниться и т.п
	 */
	var user;

	/**
	 * Объект который инициализируется при создании пользователя(который будте добавлен в каналы)
	 */
	var userTo;
	var sessionID; // нужна для того , чтобы удалить сессию в after
	var client; // является сокетом с помощью которого мы "выбрасываем" события на сервере
	var textMessage = 'trololo'; // сообщение которое будет пересылаться
	var channel; // инициализируется при создании канала
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
		newUser.save()
			.then(function(userCreated) {
				user = userCreated;
				return newUser2.save();
			})
			.then(function(userCreatedTo) {
				userTo = userCreatedTo;
				done();
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

	/**
	 * проверяем , что созданный пользователь может
	 * авторизоваться и получим cookie
	 */
	it('POST login', function(done) {
		agent
			.post('/login')
			.send({username: 'Fake', password: 'Fake123'})
			.end(function(err, res) {
				res.should.have.property('statusCode', 302);
				cookie = res.headers['set-cookie'];
				done();
			});
	});

	/**
	 * проверяем , что пользователь авторизован
	 * и его не переадресовывает на страницу /login
	 */
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

	/**
	 * Содаем такую же логику обработки соединения
	 * и обработки событий у пользователя как на сервере
	 */
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

	/**
	 * Проверем, что авторизованный пользователь может пройти весь middleware
	 * и подключиться к socket-серверу
	 */
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

	/**
	 * Проверяем, что если отправить некорректные данные
	 * при добавлении канала, то обработчик вызван не будет
	 */
	it('should server error on c.channel.add', function(done) {
		client.on(eventsCall.ADD_CHANNEL.error, function handler(data) {
			data.event.should.equal(eventsCall.ADD_CHANNEL.client);
			done();
		});
		client.emit(eventsCall.ADD_CHANNEL.client);
	});

	/**
	 * пользователь может создавать каналы
	 */
	it('should add channel to user', function(done) {
		client.on(eventsCall.ADD_CHANNEL.server, function(data) {
			channel = data.channel;
			done();
		});
		client.emit(eventsCall.ADD_CHANNEL.client, {username: userTo.username});
	});

	/**
	 * пользователь может по запросу на сервер
	 * получать данные о себе и каналы(контакты),
	 * а также , что каналы корректны
	 */
	it('should get user data', function(done) {
		client.on(eventsCall.GET_DATA.server, function(data) {
			data.contacts[channel].user.should.equal(userTo._id.toString());
			done();
		});
		client.emit(eventsCall.GET_DATA.client);
	});

	/**
	 * Проверяем, что если отправить некорректные данные
	 * при переключении канала, то обработчик вызван не будет
	 */
	it('should server error change channel', function(done) {
		client.on(eventsCall.JOIN_CHANNEL.error, function(data) {
			data.event.should.equal(eventsCall.JOIN_CHANNEL.client);
			done();
		});
		client.emit(eventsCall.JOIN_CHANNEL.client, {});
	});

	/**
	 * пользоваетель может переключаться по каналам
	 * и сервер корректно обрабатывает данные
	 */
	it('should change channel', function(done) {
		client.on(eventsCall.JOIN_CHANNEL.server, function(data) {
			data.channel.should.equal(channel);
			done();
		});
		client.emit(eventsCall.JOIN_CHANNEL.client, {id: channel});
	});

	/**
	 *  если формат сообщений будет неверным
	 * то будет выброшена ошибка
	 */
	it('message not send error', function(done) {
		var mess = {message_type: 'text', channelId: channel, text: textMessage};
		client.on(eventsCall.SEND_MESSAGE.error, function(data) {
			data.event.should.equal(eventsCall.SEND_MESSAGE.client);
			done();
		});
		client.emit(eventsCall.SEND_MESSAGE.client, mess);
	});

	/**
	 * пользователь может отпралять сообщения
	 * и ему приходят корректные данные
	 */
	it('should send message and recived', function(done) {
		var mess = {message_type: 'text', channelId: channel, text: textMessage, userId: user._id};
		client.on(eventsCall.SEND_MESSAGE.server, function(data) {
			data.message.userId.should.equal(user._id.toString());
			data.message.message.should.equal(textMessage);
			done();
		});
		client.emit(eventsCall.SEND_MESSAGE.client, mess);
	});

	/**
	 * проверяем , что будет вывброшена ошибка и обработчик вызван не будет
	 * для полученя сообщений
	 */
	it('should error on get messages by channel', function(done) {
		client.on(eventsCall.GET_MESSAGE.error, function(data) {
			data.event.should.equal(eventsCall.GET_MESSAGE.client);
			done();
		});
		client.emit(eventsCall.GET_MESSAGE.client, {channelId: channel});
	});

	/**
	 * пользователь может получать список сообщений
	 * по каналу и номеру передаваемой старнице
	 */
	it('should get messages by channel and pagenum', function(done) {
		client.on(eventsCall.GET_MESSAGE.server, function(data) {
			data.data.should.be.instanceof(Array).and.have.lengthOf(1);
			data.data[0].userId.should.equal(user._id.toString());
			data.data[0].message.should.equal(textMessage);
			data.data[0].channelId.should.equal(channel);
			done();
		});
		client.emit(eventsCall.GET_MESSAGE.client, {channelId: channel, page: 1});
	});

})
