var shell = require('shelljs');
shell.rm('-rf', 'build');
shell.rm('-f', 'tenon*.json');
shell.rm('-f', 'tenon*.html');
shell.rm('-f', 'axe*.json');
shell.rm('-f', 'axe*.html');
