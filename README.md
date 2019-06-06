# ksuid

Generate prefixed, k-sorted globally unique identifiers.

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
