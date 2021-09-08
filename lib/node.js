const path = require('path');
const Id = require('./id');
const Instance = require('./instance');
const validation = require('./validation');
const { Buffer } = require('buffer');

class Node {
	constructor(environment = 'prod', instance = getInstance()) {
		this.environment = environment;
		this.instance = instance;

		this._lastTimestamp = 0;
		this._currentSequence = 0;
	}

	get environment() {
		return this._environment;
	}

	set environment(value) {
		validation.checkPrefix('environment', value);

		this._environment = value;
	}

	get instance() {
		return this._instance;
	}

	set instance(value) {
		validation.checkClass('instance', value, Instance);

		this._instance = value;
	}

	generate(resource) {
		if (typeof resource !== 'string')
			throw new Error('resource must be a string');

		if (!resource)
			throw new Error('resource must not be empty');

		const now = Math.floor(Date.now() / 1000);

		if (this._lastTimestamp === now) {
			this._currentSequence += 1;
		} else {
			this._lastTimestamp = now;
			this._currentSequence = 0;
		}

		return new Id(
			this.environment,
			resource,
			this._lastTimestamp,
			this.instance,
			this._currentSequence
		);
	}
}

module.exports = Node;

function getInstance() {
	let id = null;

	// Detect browser environment
	if (typeof window !== 'undefined') {
		const buf = Buffer.alloc(8);

		return new Instance(Instance.schemes.RANDOM, window.crypto.getRandomValues(buf));
	}

	if ((id = getDockerInstance()))
		return id;

	if ((id = getMacPidInstance()))
		return id;

	const crypto = require('crypto');

	return new Instance(Instance.schemes.RANDOM, crypto.randomBytes(8));
}

function getDockerInstance() {
	const fs = require('fs');

	if (!fs.existsSync('/proc/1/cpuset'))
		return null;

	const src = fs.readFileSync('/proc/1/cpuset', 'utf8').trim();

	if (!src.startsWith('/docker'))
		return null;

	const bytes = Buffer.from(path.basename(src), 'hex');

	if (bytes.length !== 32)
		return null;

	return new Instance(Instance.schemes.DOCKER_CONT, bytes.slice(0, 8));
}

function getMacPidInstance() {
	const os = require('os');
	const interfaces = [].concat(...Object.values(os.networkInterfaces()));
	const int = interfaces.find(i => !i.internal && i.mac !== '00:00:00:00:00:00' && !i.mac.startsWith('02:42'));

	if (!int)
		return null;

	const buf = Buffer.alloc(8);

	buf.write(int.mac.replace(/:/g, ''), 0, 6, 'hex');
	buf.writeUInt16BE(process.pid % 65536, 6);

	return new Instance(Instance.schemes.MAC_AND_PID, buf);
}

