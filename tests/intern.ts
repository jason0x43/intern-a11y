import intern = require('intern');

export const capabilities = { name: 'intern-a11y' };

export const environments = [
	{ browserName: 'chrome' }
];

export const tunnel = 'SeleniumTunnel';

export const loaders = {
	'host-browser': 'node_modules/dojo/loader.js',
	'host-node': 'dojo/loader'
};

export const loaderOptions = {
	packages: [
		{ name: 'src', location: 'build/src' },
		{ name: 'tests', location: 'build/tests' }
	]
};

export const suites = [ 'tests/unit/*' ];

export const functionalSuites = [ 'tests/functional/*' ];

export const excludeInstrumentation = /(?:node_modules|bower_components|tests)[\/]/;

export const filterErrorStack = true;
