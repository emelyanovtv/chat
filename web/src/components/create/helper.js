import Hashids from 'hashids';
function createHash() {
	const currentDate = (new Date()).valueOf().toString();
	var hashids = new Hashids(currentDate);
	const random = Math.ceil(Math.random() * 10000000 + 1);
	return hashids.encode(random);
}
module.exports = createHash;
