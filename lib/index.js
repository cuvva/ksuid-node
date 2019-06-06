const Id = require('./id');
const Instance = require('./instance');
const Node = require('./node');

const node = new Node();

module.exports = {
	Id,
	Node,
	Instance,

	parse(input) {
		return Id.parse(input);
	},

	generate(resource) {
		return node.generate(resource);
	},

	get environment() {
		return node.environment;
	},

	set environment(value) {
		node.environment = value;
	},

	get instance() {
		return node.instance;
	},

	set instance(value) {
		node.instance = value;
	},
};
