const constants = require('./constants');

function checkPrefix(field, value) {
	if (typeof value !== 'string')
		throw new Error(`${field} must be a string`);

	if (constants.prefixRegex.test(value))
		return;

	throw new Error(`${field} contains invalid characters`);
}

function checkUint(field, value, byteLength) {
	if (!Number.isInteger(value))
		throw new Error(`${field} must be an integer`);

	if (value < 0)
		throw new Error(`${field} must be positive`);

	if (value >= Math.pow(2, byteLength * 8))
		throw new Error(`${field} must be a uint${byteLength * 8}`);
}

function checkUint8Array(field, value, byteLength) {
	if (!(value instanceof Uint8Array))
		throw new Error(`${field} must be a Uint8Array of derivative`);

	if (value.length !== byteLength)
		throw new Error(`${field} must be ${byteLength} bytes`);
}

function checkClass(field, value, classType) {
	if (!(value instanceof classType))
		throw new Error(`${field} must be an instance of ${classType.name}`);
}

exports.checkPrefix = checkPrefix;
exports.checkUint = checkUint;
exports.checkUint8Array = checkUint8Array;
exports.checkClass = checkClass;
