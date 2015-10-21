var forever = require('forever-monitor');
var fs = require('fs');
var watchIgnorePatterns = [
	'server/db/**',
	'node_modules/**',
	'web/build/**',
	'.idea/**',
	'.git/**'
];

var child = new(forever.Monitor)('./server/server.js', {
	'silent': false,
	'pidFile': 'server/pids/app.pid',
	'watch': true,
	'watchDirectory': './',
	'watchIgnoreDotFiles': true,
	'watchIgnorePatterns': watchIgnorePatterns,
	'logFile': fs.existsSync('logs/forever.log') ? 'logs/forever.log' : '',
	'outFile': fs.existsSync('logs/forever.out') ? 'logs/forever.out' : '',
	'errFile': fs.existsSync('logs/forever.err') ? 'logs/forever.err' : ''
});

child.on('watch:restart', function(info) {
	console.error('Restaring script because ' + info.stat + ' changed');
});

child.start();
