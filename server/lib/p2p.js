var redis = require('./redisclient');
var Channel = require('./../models/channel').Channel;
var User = require('./../models/user').User;
var sessionStore = require('./../lib/database/sessionStore');
var config = require('./../config');
// нужно всю логику перенсти сюда
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
		var newChannelObj = {
			name: data.hash,
			encrypted: encrypted,
			anonym: true,
			type: 'user',
			users: []
		};

		var newChannel = new Channel(newChannelObj);
		return newChannel.save().
			then(function(channel) {
				data.channel = channel._id;
				redis.set(data.hash, JSON.stringify(data));
			});
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
	 * @param hash
	 * @param req
	 */
	prepareChat: function(hash, req) {
		var _this = this;
		this.req = req;
		return this.getChat(hash).
			then(function(data) {
				return _this.stringToJson(data);
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
				return Channel.update({_id: _this.redisData.channel}, { $addToSet: { users: user.user_id } });
			}).
			then(function() {
				return true;
			}).
			catch(function(err) {
				console.log(err);
				return false;
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
		user = new User(
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
