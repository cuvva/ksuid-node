# ksuid

Generate prefixed, k-sorted globally unique identifiers.


[![NPM Version](https://img.shields.io/npm/v/@cuvva/ksuid.svg?style=flat)](//www.npmjs.org/package/@cuvva/ksuid)
[![Build Status](https://img.shields.io/travis/cuvva/ksuid-node.svg?style=flat)](//travis-ci.org/cuvva/ksuid-node)
[![Coverage Status](https://img.shields.io/coveralls/cuvva/ksuid-node.svg?style=flat)](//coveralls.io/r/cuvva/ksuid-node)

## Installation

```bash
$ yarn add @cuvva/ksuid
```

## Usage

```js
const ksuid = require('@cuvva/ksuid');

const id = ksuid.generate('user').toString();
// user_000000BgNwexbyo1VZs78wVMGdBo3

try {
	const parsed = ksuid.parse('user_000000BgNwexbyo1VZs78wVMGdBo3');
} catch (error) {
	console.log('uh oh!');
}
```

## Testing

Install the development dependencies first:

```bash
$ yarn
```

Then run the tests 👩‍🔬:

```bash
$ yarn test
```

## Support

Please open an issue on this repository.

## License

MIT licensed - see [LICENSE](/LICENSE) file
