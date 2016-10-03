import * as intern from 'intern';

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

// Only load the unit test suites if we're in a Node environment
export const suites = [ 'tests/unit/**', 'tests/integration/tenon' ];

export const functionalSuites = [ 'tests/integration/axe' ];

export const excludeInstrumentation = /(?:node_modules|bower_components|tests)[\/]/;

export const filterErrorStack = true;
