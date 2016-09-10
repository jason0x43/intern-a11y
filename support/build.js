var shell = require('shelljs');
shell.exec('node ./node_modules/.bin/tsc');
shell.cp('package.json', 'build');
