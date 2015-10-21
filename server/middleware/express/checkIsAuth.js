module.exports = function(req, res, next) {
	if (req.session.passport !== undefined) {
		res.redirect('/');
	}

	next();
};
