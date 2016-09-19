var shell = require('shelljs');
var args = process.argv.slice(2);

var mode = args[0] || 'client';

switch (mode) {
case 'client':
	shell.exec('node node_modules/intern/client config=build/tests/intern.js');
	break;
case 'runner':
	shell.exec('node node_modules/intern/runner config=build/tests/intern.js');
	break;
case 'all':
	shell.exec('node node_modules/intern/client config=build/tests/intern.js');
	shell.exec('node node_modules/intern/runner config=build/tests/intern.js');
	break;
default:
	console.log('Invalid mode "' + mode + '"');
}
