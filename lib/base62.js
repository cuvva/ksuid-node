const baseX = require('base-x');

const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const base62 = baseX(alphabet);

exports.encode = encode;
exports.decode = decode;

function decode(input) {
	try {
		return base62.decode(input);
	} catch (e) {
		throw new Error('base62 decode failed');
	}
}

function encode(input) {
	try {
		return base62.encode(input);
	} catch (e) {
		throw new Error('base62 encode failed');
	}
}
