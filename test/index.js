const mockDate = require('mockdate');
const mockOs = require('mock-os');
const test = require('tape');
const ksuid = require('..');

const baseTimestamp = 1521470472; // 2018-03-19T14:41:12+00:00

test('parsing invalid', t => {
	t.throws(
		() => ksuid.parse(6),
		/input must be a string/,
	);
	t.throws(
		() => ksuid.parse(''),
		/input must not be empty/,
	);
	t.end();
});

test('setting valid environment', t => {
	ksuid.environment = 'dev';
	t.equal(ksuid.environment, 'dev');

	// reset environment
	ksuid.environment = 'prod';

	t.end();
});

test('setting invalid environment', t => {
	t.throws(
		() => (ksuid.environment = 'xo_xo'),
		/environment contains invalid characters/
	);
	t.throws(
		() => (ksuid.environment = '!env'),
		/environment contains invalid characters/
	);
	t.throws(
		() => (ksuid.environment = 'Env'),
		/environment contains invalid characters/
	);

	t.end();
});

test('parsing without environment', t => {
	const output = ksuid.parse('test_000000BPG1Uoez0pTaSKn9EtsNayW');

	t.equal(output.environment, 'prod');
	t.equal(output.resource, 'test');
	t.equal(output.timestamp, 1522944503);
	t.equal(output.instance.scheme, ksuid.Instance.schemes.MAC_AND_PID);
	t.equal(output.instance.identifier.toString('hex'), '8c85905f44ca63bb');
	t.equal(output.sequenceId, 0);

	t.end();
});

test('parsing with invalid environment', t => {
	t.throws(
		() => ksuid.parse('Xx_test_000000BPG1Uoez0pTaSKn9EtsNayW'),
		/id is invalid/
	);
	t.throws(
		() => ksuid.parse('x!_test_000000BPG1Uoez0pTaSKn9EtsNayW'),
		/id is invalid/
	);
	t.throws(
		() => ksuid.parse('_x_test_000000BPG1Uoez0pTaSKn9EtsNayW'),
		/id is invalid/
	);

	t.end();
});

test('parsing with invalid resource', t => {
	t.throws(
		() => ksuid.parse('t!est_000000BPG1Uoez0pTaSKn9EtsNayW'),
		/id is invalid/
	);
	t.throws(
		() => ksuid.parse('Tes&t_000000BPG1Uoez0pTaSKn9EtsNayW'),
		/id is invalid/
	);
	t.throws(
		() => ksuid.parse('__test_000000BPG1Uoez0pTaSKn9EtsNayW'),
		/id is invalid/
	);

	t.end();
});

test('parsing with environment', t => {
	const output = ksuid.parse('dev_test_000000BPG296UCnyv841TMQvmOhqS');

	t.equal(output.environment, 'dev');
	t.equal(output.resource, 'test');
	t.equal(output.timestamp, 1522944867);
	t.equal(output.instance.scheme, ksuid.Instance.schemes.MAC_AND_PID);
	t.equal(output.instance.identifier.toString('hex'), '8c85905f44ca63bb');
	t.equal(output.sequenceId, 0);

	t.end();
});

test('parsing without environment or resource', t => {
	t.throws(
		() => ksuid.parse('000000BPG296UCnyv841TMQvmOhqS'),
		/id is invalid/,
	);

	t.end();
});

test('parsing with invalid id characters', t => {
	t.throws(
		() => ksuid.parse('test_000000BPG296UCnyv841TMQvmOhq!'),
		/id is invalid/,
	);

	t.end();
});

test('parsing with invalid id length', t => {
	t.throws(
		() => ksuid.parse('test_000000BPG296UCnyv841TMQvmOhqSP'),
		/id is invalid/,
	);
	t.throws(
		() => ksuid.parse('test_000000BPG296UCnyv841TMQvmOhq'),
		/id is invalid/,
	);

	t.end();
});

test('parsing with prod env specified', t => {
	t.throws(
		() => ksuid.parse('prod_test_000000BPG296UCnyv841TMQvmOhqS'),
		/production env is implied/,
	);

	t.end();
});

test('generating', t => {
	const timestamp = baseTimestamp + 1;

	// mock
	mockDate.set(new Date(timestamp * 1000));

	mockOs({
		networkInterfaces: {
			lo0: [{ mac: '00:00:00:00:00:00', internal: true }],
			en0: [
				{ mac: '8c:85:90:5f:44:cc', internal: true },
				{ mac: '00:00:00:00:00:00', internal: false },
				{ mac: '8c:85:90:5f:44:cb', internal: false },
			],
		},
	});

	const node = new ksuid.Node();
	const id = node.generate('test');

	t.equal(id.environment, 'prod');
	t.equal(id.resource, 'test');
	t.equal(id.timestamp, timestamp);
	t.equal(id.instance.scheme, ksuid.Instance.schemes.MAC_AND_PID);
	t.equal(id.instance.identifier.slice(0, 6).toString('hex'), '8c85905f44cb');
	t.equal(id.sequenceId, 0);

	mockOs.restore();
	mockDate.reset();
	t.end();
});

test('generating with no network adapters', t => {
	mockOs({ networkInterfaces: {} });

	const node = new ksuid.Node();
	const id = node.generate('test');

	t.equal(id.instance.scheme, ksuid.Instance.schemes.RANDOM);
	t.equal(id.instance.identifier.length, 8);

	mockOs.restore();
	t.end();
});

test('sequencing', t => {
	const timestampA = (baseTimestamp + 2) * 1000;
	const timestampB = (baseTimestamp + 3) * 1000;
	const timestampC = ((baseTimestamp + 4) * 1000);

	mockDate.set(new Date(timestampA));

	const seqOne = ksuid.parse(ksuid.generate('test').toString());
	const seqTwo = ksuid.parse(ksuid.generate('test').toString());

	mockDate.set(new Date(timestampB));

	const seqOneAgain = ksuid.parse(ksuid.generate('test').toString());

	t.equal(seqOne.sequenceId, 0);
	t.equal(seqTwo.sequenceId, 1);
	t.equal(seqOneAgain.sequenceId, 0);

	mockDate.set(new Date(timestampC));
	const seqStdOne = ksuid.parse(ksuid.generate('test').toString());

	mockDate.set(new Date(timestampC + 999));
	const seqStdTwo = ksuid.parse(ksuid.generate('test').toString());

	mockDate.set(new Date(timestampC + 1000));
	const seqStdFlipped = ksuid.parse(ksuid.generate('test').toString());

	t.equal(seqStdOne.sequenceId, 0);
	t.equal(seqStdTwo.sequenceId, 1);
	t.equal(seqStdFlipped.sequenceId, 0);

	mockDate.reset();
	t.end();
});

test('generating with invalid resource', t => {
	t.throws(
		() => ksuid.generate(2),
		/resource must be a string/
	);
	t.throws(
		() => ksuid.generate(''),
		/resource must not be empty/
	);
	t.end();
});

test('generating non-prod id', t => {
	const devNode = new ksuid.Node('dev');
	const devId = devNode.generate('test').toString();
	const prodId = ksuid.generate('test').toString();

	t.ok(devId.startsWith('dev_'));
	t.ok(prodId.startsWith('test_'));

	t.end();
});

test('id constructor string validation', t => {
	t.throws(
		() => new ksuid.Id(6),
		/environment must be a string/
	);
	t.throws(
		() => new ksuid.Id(''),
		/environment contains invalid characters/
	);

	t.end();
});

test('id constructor timestamp validation', t => {
	t.throws(
		() => new ksuid.Id('test', 'test', 'a'),
		/timestamp must be an integer/
	);
	t.throws(
		() => new ksuid.Id('test', 'test', -1),
		/must be positive/
	);

	t.end();
});

test('id constructor machine id', t => {
	t.throws(
		() => new ksuid.Id('test', 'test', 0, ''),
		/instance must be an instance of Instance/
	);
	t.throws(
		() => new ksuid.Id('test', 'test', 0, Buffer.alloc(1)),
		/instance must be an instance of Instance/
	);

	t.end();
});

test('id constructor machine id', t => {
	t.throws(
		() => new ksuid.Instance(256, Buffer.alloc(8)),
		/scheme must be a uint8/
	);
	t.throws(
		() => new ksuid.Instance(0, Buffer.alloc(6)),
		/identifier must be 8 bytes/
	);

	t.end();
});
