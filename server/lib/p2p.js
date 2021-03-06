var redis = require('./redisclient');
var models = require('./../models');
var sessionStore = require('./../lib/database/sessionStore');
var config = require('./../config');

var p2p = {
	/**
	 * request {Object}
	 */
	req: null,
	redisData: null,
	colors: ['31b0c3', 'fdc689', 'f8a232', 'f8a232', 'f6a4c9', '8c6239', '39b54a'],
	avatars: ['/img/avatar-1.png', '/img/avatar-2.png', '/img/avatar-3.png', '/img/avatar-4.png', '/img/avatar-5.png', '/img/avatar-6.png', '/img/avatar-7.png'],
	a: ['Small', 'Blue', 'Ugly'],
	b: ['Bear', 'Dog', 'Banana'],
	/**
	 * @param data
	 * @returns {Promise.<T>}
	 */
	addChat: function(data) {
		var encrypted = false;
		if ( data.isEncrypted !== undefined && data.isEncrypted.toString() === '1' ) {
			encrypted = true;
		}
		return this.createAnonymusChannel(data, encrypted);
	},
	/**
	 * @param hash
	 * @return {Object|Boolean|Function}
	 */
	getChat: function(hash) {
		return redis.get(hash);
	},
	/**
	 * @param str
	 * @return {Object}
	 */
	stringToJson: function(str) {
		return JSON.parse(str);
	},
	/**
	 * @param data {Object}
	 * @param encrypted {String}
	 * @returns {Promise.<T>}
	 */
	createAnonymusChannel: function(data, encrypted) {
		var temporaryVal = parseInt(data.temporary, 10);
		var temporary = !isNaN(temporaryVal) && temporaryVal > 0;
		var promise;
		var newChannelObj = {
			name: data.hash,
			encrypted: encrypted,
			anonym: true,
			temporary: temporary,
			type: 'room',
			users: []
		};

		if (temporary) {
			newChannelObj.expireAt = (parseInt((+new Date) / 1000, 10) + temporaryVal).toString();
		}

		var newChannel = new models.Channel(newChannelObj);
		return newChannel.save().
			then(function(channel) {
				data.channel = channel._id;
				if (temporary) {
					promise = redis.multi()
						.set(data.hash, JSON.stringify(data))
						.expire(data.hash, temporaryVal)
						.exec();
				} else {
					promise = redis.set(data.hash, JSON.stringify(data));
				}

				return promise;
			});
	},
	/**
	 * @param hash
	 * @param req
	 */
	prepareChat: function(hash, req) {
		var _this = this;
		var resp = {status: false, error: null};
		this.req = req;
		return this.getChat(hash).
			then(function(data) {
				if (!data) {
					return models.Channel.findOne({name: hash}).
						then(function(channel) {
							if (channel !== null) {
								models.Message.find({ channelId: { $in: [channel._id] } }).remove(function(err, mess) {});
								channel.remove(function(err, mess) {});
							}
							return Promise.reject(new Error('This Anonymus chat not exist'));
						});
				} else {
					return _this.stringToJson(data);
				}
			}).
			then(function(jsonData) {
				_this.redisData = jsonData;
				// Если не существует в сесси анонимный пользователь
				if (!req.session.anonymus) {
					return _this.createAnonymusUser().
						then(function(user) {
							// Создаем новую сессию
							return _this.reloadSession('anonymus', {
								user_id: user._id,
								username: user.username,
								channel: _this.redisData.channel
							});
						});
				} else {
					if (req.session.anonymus.channel !== _this.redisData.channel) {
						return _this.reloadSession('anonymus', {
							user_id: req.session.anonymus.user_id,
							username: req.session.anonymus.username,
							channel: _this.redisData.channel
						});
					} else {
						return req.session.anonymus;
					}
				}
			}).
			then(function(user) {
				return models.Channel.update({_id: _this.redisData.channel}, { $addToSet: { users: user.user_id } });
			}).
			then(function() {
				resp.status = true;
				return resp;
			}).
			catch(function(err) {
				resp.error = err;
				return resp;
			});
	},
	reloadSession: function(name, object) {
		var _this = this;
		return new Promise(function(resolve) {
			sessionStore.load(_this.getSessionID(), function(err, session) {
				if (session !== undefined) {
					session[name] = object;
					session.reload(function() {
						session.touch().save();
						resolve(session[name]);
						// если в канале нет пользователя его нужно всегда добавлять
					});
				} else {
					_this.req.session[name] = object;
					_this.req.session.save();
					resolve(_this.req.session[name]);
				}
			});
		});
	},
	/**
	 * @return {Promise}
	 */
	createAnonymusUser: function() {
		var numC = Math.floor((Math.random() * this.colors.length) + 1) - 1;
		var numA = Math.floor((Math.random() * this.avatars.length) + 1) - 1;
		var color = this.colors[numC];
		var avatar = this.avatars[numA];
		var user = {};
		var rA = Math.floor(Math.random() * this.a.length);
		var rB = Math.floor(Math.random() * this.b.length);
		var name = this.a[rA] + this.b[rB] + Math.random().toString();
		var email = name + '@' + name + '.com';
		var username = name;
		var password = Math.random().toString();
		user = new models.User(
			{
				username: username,
				password: password,
				email: email,
				color: color,
				avatar: avatar,
				anonymus: true
			}
		);

		return user.save();
	},
	/**
	 * @return {String}
	 */
	getSessionID: function() {
		var sid = null;
		var sessionKey = config.get('session:key');
		if (this.req !== null) {
			sid = this.req.signedCookies[sessionKey];
		}
		return sid;
	}
}

module.exports = p2p;
