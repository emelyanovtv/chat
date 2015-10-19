var promiseFactory = require('q').Promise;
var	redis = require('promise-redis')(promiseFactory);
var client = redis.createClient();

module.exports = client;
