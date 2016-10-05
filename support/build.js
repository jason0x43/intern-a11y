var shell = require('shelljs');
var path = require('path');
var glob = require('glob');
var buildDir = 'build';

shell.exec('node ./node_modules/.bin/tsc');
shell.cp('package.json', path.join(buildDir, 'src'));
glob.sync('tests/**/*.{html,json}').forEach(function (resource) {
	var dst = path.join(buildDir, resource);
	var dstDir = path.dirname(dst);
	if (!shell.test('-d', dstDir)) {
		shell.mkdir(dstDir);
	}
	shell.cp(resource, dst);
});
