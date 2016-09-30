var args = process.argv.slice(2);
var spawn = require('child_process').spawnSync
var mode = 'client';

function run(runner, config, userArgs) {
	spawn('node', [
		'node_modules/intern/' + runner,
		'config=build/tests/' + config + '.js'
	].concat(userArgs), { stdio: 'inherit' });
}

switch (args[0]) {
case 'client':
case 'runner':
case 'local':
case 'all':
	mode = args[0];
	args = args.slice(1);
	break;
}

switch (mode) {
case 'runner':
	run('runner', 'intern', args);
	break;
case 'local':
	run('client', 'intern-local', args);
	run('runner', 'intern-local', args);
	break;
case 'all':
	run('client', 'intern', args);
	run('runner', 'intern', args);
	break;
default:
	run('client', 'intern', args);
}
