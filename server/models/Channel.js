var mongoose = require('./../lib/database/mongoose');
var models = mongoose.models;
var manager = require('./../socket/manager');
var Schema = mongoose.Schema;

// схема модели пользователя
var schema = new Schema({
	name: {
		type: String,
		required: true
	},
	anonym: {
		type: Boolean,
		default: false
	},
	encrypted: {
		type: Boolean,
		default: false
	},
	temporary: {
		type: Boolean,
		default: false
	},
	expireAt: {
		type: String,
		default: null
	},
	type: {
		type: String,
		enum: ['room', 'user'],
		required: true
	},
	users: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}]
});

schema.statics.findOrCreate = function(type, userCreateId, userAddId) {
	var Channel = this;
	var newChannelObj;
	var newChannel = {};
	// если пользоваетель хочет добавить сама себя
	if (userCreateId !== userAddId) {
		return Channel.findOne({$and: [{users: {$in: [userCreateId]}}, {users: {$in: [userAddId]}}, {type: type}]}).
			then(function(channel) {
				if (!channel) {
					newChannelObj = {
						name: type + '_' + userCreateId + '_' + userAddId,
						type: type,
						users: [userCreateId, userAddId]
					};
					newChannel = new Channel(newChannelObj);
					return newChannel.save();
				}
				return Promise.resolve(channel);
			});
	}

	return Promise.reject('Channel not exsist and not created!');
};

schema.statics.getChannelInitialData = function(channel) {
	return {
		_id: channel._id,
		user: null,
		type: channel.type,
		name: channel.name,
		is_online: false,
		message_count: 0,
		avatar: '/img/avatar-1.png',
		color: '000',
		lastMessage: '',
		total_messages: 0,
		encrypted: channel.encrypted,
		temporary: channel.temporary,
		expireAt: channel.expireAt
	};
};

/**
 * prepareChannel
 * @param  {String} id      User id
 * @param  {Object} channel Channel data
 * @param  {Object} Users   Global users object, contain all active chat users
 * @return {Promise}
 */
schema.statics.prepareChannel = function(id, channel) {
	var userID;
	var customObject = this.getChannelInitialData(channel);
	if (channel.type === 'user') {
		channel.users.splice(channel.users.indexOf(id), 1);
		userID = customObject.user = channel.users[0];
		channel.users.push(id);
		customObject.is_online = manager.users.has(userID);

		return Promise.all(
			[
				models.User.getUserByID(userID),
				models.Message.getUnreadMessagesByChannel(channel._id, id),
				models.Message.getLastChannelMessage(channel._id),
				models.Message.getMessagesCountByChannel(channel._id)
			])
			.then(function(result) {
				var user = result[0];
				var unreadMessages = result[1];
				var lastMessage = result[2] ? result[2].message : '';
				var totalMessages = result[3] ? result[3] : customObject.total_messages;
				return Object.assign(customObject, {
					name: user.username,
					avatar: user.avatar,
					color: user.color,
					message_count: unreadMessages.length,
					lastMessage: lastMessage,
					total_messages: totalMessages
				});
			});
	}

	return Promise.resolve(customObject);
};

schema.statics.getContactsByUserID = function(id, anonym) {
	var Channel = this;

	return Channel.find({$and: [{ users: { $in: [id] } }, { anonym: anonym}]}).then(function(channelsData) {
		if (channelsData.length > 0) {
			return Promise
				.all(channelsData.map(function(channel) {
					return Channel.prepareChannel(id, channel);
				}))
				.then(function(result) {
					var channels = {};
					result.forEach(function(channel) {
						channels[channel._id] = channel;
					});
					return channels;
				});
		}
		return Promise.resolve({});
	});
};

module.exports = mongoose.model('Channel', schema);
