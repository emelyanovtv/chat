var p2p = require('./../lib/p2p');

exports.get = function(req, res) {
	var hash = req.params.hash;
	if (hash.length) {
		p2p.prepareChat(hash, req).
		then(function(val) {
			if (val) {
				res.render('index');
			} else {
				res.render('error', '404');
			}
		}).catch(function(err) {
			res.render('error', err);
		});
	}
};
