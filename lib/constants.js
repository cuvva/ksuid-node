const decodedLen = 21;
const encodedLen = 29;
const ksuidRegex = (/^(?:([a-z\d]+)_)?([a-z\d]+)_([a-zA-Z\d]{29})$/);
const prefixRegex = (/^[a-z\d]+$/);

exports.decodedLen = decodedLen;
exports.encodedLen = encodedLen;
exports.ksuidRegex = ksuidRegex;
exports.prefixRegex = prefixRegex;
