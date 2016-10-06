var args = process.argv.slice(2);
var spawn = require('child_process').spawnSync
var mode = 'client';

function run(runner, config, userArgs) {
	spawn('node', [
		'node_modules/intern/' + runner,
		'config=tests/' + config + '.js'
	].concat(userArgs), { stdio: 'inherit' });
}

switch (args[0]) {
case 'client':
case 'runner':
	mode = args[0];
	args = args.slice(1);
	break;
}

switch (mode) {
case 'runner':
	run('runner', 'intern', args);
	break;
default:
	run('client', 'intern', args);
}
