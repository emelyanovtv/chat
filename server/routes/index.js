
var checkAuth = require('./../middleware/checkAuth');
var checkIsAuth = require('./../middleware/checkIsAuth');
var passport = require('./../lib/passport');
var p2p = require('./../lib/p2p');

module.exports = function(app) {
	app.get('/', checkAuth, require('./frontpage').get);
	app.get('/login', checkIsAuth, require('./frontpage').get);
	app.get('/create', require('./frontpage').get);
	app.post('/create', function(req, res) {
		p2p.addChat(req.body).then(function(status) {
			if (status === 'OK' || (status instanceof Array && status[0] === 'OK')) {
				res.json({ error: null });
			} else {
				res.json({ error: true });
			}
		});
	});
	app.post('/login', function(req, res) {
		passport.authenticate('local', {session: true}, function(err, user) {
			if (req.xhr) {
				if (err) {
					return res.json({ error: err.message });
				}
				if (!user) { return res.json({error: 'Invalid Login'}); }
				req.login(user, {}, function(err) {
					if (err) {
						return res.json({error: err});
					}
					res.json({ error: null });
				});
			}
		})(req, res);
	});

	app.get('/chat/:hash/', require('./chat').get);

	app.get('/login-fb', passport.authenticate('facebook', {scope: 'email'}));
	app.get('/register', require('./frontpage').get);
	app.post('/register', require('./register').post);

	app.get('/login-fb-callback*',
			passport.authenticate('facebook',
				{
					successRedirect: '/',
					failureRedirect: '/login'
				}
			)
	);

	app.get('/login-vk',
		passport.authenticate('vk', {
			scope: ['email', 'friends']
		}),
		function() {
			// The request will be redirected to vk.com
			// for authentication, so
			// this function will not be called.
		});

	app.get('/login-vk-callback',
		passport.authenticate('vk', {
			successRedirect: '/',
			failureRedirect: '/login'
		}),
		function(req, res) {
			// Successful authentication
			// redirect home.
			res.redirect('/');
		});

	app.get('/logout', checkAuth, require('./logout').get);
};
