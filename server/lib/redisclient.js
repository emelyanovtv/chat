var promiseFactory = require('q').Promise;
var	redis = require('promise-redis')(promiseFactory);
var config = require('./../config');
var client = redis.createClient(config.get('redis:uri'));
module.exports = client;
