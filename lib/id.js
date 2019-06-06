const Instance = require('./instance');
const base62 = require('./base62');
const constants = require('./constants');
const validation = require('./validation');

function def(obj, field, val) {
	Object.defineProperty(obj, field, {
		value: val,
		configurable: false,
		enumerable: true,
		writable: false,
	});
}

class Id {
	constructor(environment, resource, timestamp, instance, sequenceId) {
		validation.checkPrefix('environment', environment);
		validation.checkPrefix('resource', resource);
		validation.checkUint('timestamp', timestamp, 8);
		validation.checkClass('instance', instance, Instance);
		validation.checkUint('sequenceId', sequenceId, 4);

		def(this, 'environment', environment);
		def(this, 'resource', resource);
		def(this, 'timestamp', timestamp);
		def(this, 'instance', instance);
		def(this, 'sequenceId', sequenceId);
	}

	toString() {
		// immutable, so cache
		if (this._str)
			return this._str;

		const env = this.environment === 'prod' ? '' : `${this.environment}_`;
		const prefix = `${env}${this.resource}_`;

		const decoded = Buffer.alloc(constants.decodedLen);

		// JS can't yet store 64-bit numbers accurately
		// for now, we're just writing the lower 48 bits
		// this will become a problem at 8921556-12-07T10:44:16Z
		decoded.writeUIntBE(this.timestamp, 2, 6);
		this.instance.toBuffer().copy(decoded, 8, 0, 9);
		decoded.writeUInt32BE(this.sequenceId, 17);

		const encoded = padStart(base62.encode(decoded), constants.encodedLen, '0');

		return (this._str = prefix + encoded);
	}

	static parse(input) {
		if (typeof input !== 'string')
			throw new Error('input must be a string');

		if (!input.length)
			throw new Error('input must not be empty');

		const { environment, resource, encoded } = splitPrefixId(input);

		const decoded = base62.decode(encoded).slice(-constants.decodedLen);

		if (decoded.readUInt16BE(0) !== 0)
			throw new Error('timestamp greater than 8921556-12-07T10:44:16Z');

		return new Id(
			environment,
			resource,
			decoded.readUIntBE(2, 6),
			Instance.fromBuffer(decoded.slice(8, 17)),
			decoded.readUInt32BE(17)
		);
	}
}

function splitPrefixId(input) {
	const parsed = constants.ksuidRegex.exec(input);

	if (!parsed)
		throw new Error('id is invalid');

	const [, environment, resource, encoded] = parsed;

	if (environment === 'prod')
		throw new Error('production env is implied');

	return {
		environment: environment || 'prod',
		resource,
		encoded,
	};
}

module.exports = Id;

function padStart(string, targetLength, padString = ' ') {
	if (string.length >= targetLength)
		return string;

	targetLength -= string.length;

	if (targetLength > padString.length)
		padString += padString.repeat(targetLength / padString.length);

	return padString.slice(0, targetLength) + string;
}
