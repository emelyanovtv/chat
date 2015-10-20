var p2p = require('./../lib/p2p');

exports.get = function(req, res) {
	var hash = req.params.hash;
	if (hash.length) {
		p2p.prepareChat(hash, req).
		then(function(resp) {
			if (resp.status) {
				res.render('index');
			} else {
				res.render('error', {error: {message: resp.error.toString()}});
			}
		}).catch(function(err) {
			res.render('error', err.message);
		});
	}
};
