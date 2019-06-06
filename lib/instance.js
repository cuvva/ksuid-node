const validation = require('./validation');

function def(obj, field, val) {
	Object.defineProperty(obj, field, {
		value: val,
		configurable: false,
		enumerable: true,
		writable: false,
	});
}

class Instance {
	constructor(scheme, identifier) {
		validation.checkUint('scheme', scheme, 1);
		validation.checkBuffer('identifier', identifier, 8);

		def(this, 'scheme', scheme);
		def(this, 'identifier', identifier);
	}

	toBuffer() {
		// immutable, so cache
		if (this._buf)
			return this._buf;

		const buf = Buffer.alloc(9);

		buf[0] = this.scheme;
		this.identifier.copy(buf, 1, 0, 8);

		return (this._buf = buf);
	}

	static fromBuffer(buffer) {
		validation.checkBuffer('buffer', buffer, 9);

		return new Instance(
			buffer[0],
			buffer.slice(1)
		);
	}
}

module.exports = Instance;

Instance.schemes = {
	RANDOM: 82, // R
	MAC_AND_PID: 72, // H
	DOCKER_CONT: 68, // D
};
