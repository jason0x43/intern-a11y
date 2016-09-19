import * as registerSuite from 'intern!object';
import * as Test from 'intern/lib/Test';
import * as tenon from 'intern/dojo/has!host-node?intern/dojo/node!../../../../../../src/tenon';
import * as fs from 'intern/dojo/has!host-node?intern/dojo/node!fs';
import { IRequire } from 'dojo/loader';

declare const require: IRequire;

registerSuite({
	name: 'tenon',

	'external url': function (this: Test) {
		if (!tenon) {
			this.skip('requires Node');
		}

		return tenon.run({
			source: 'http://google.com',
			sourceType: 'url',
			apiKey: '829e9d1325d5a06709996500ce953a4a',
			report: 'tenon_url.json'
		});
	},

	'file name': function (this: Test) {
		if (!tenon) {
			this.skip('requires Node');
		}

		return tenon.run({
			source: require.toUrl('../functional/page.html'),
			sourceType: 'file',
			apiKey: '829e9d1325d5a06709996500ce953a4a',
			report: 'tenon_file.json'
		});
	},

	'file data': function (this: Test) {
		if (!tenon) {
			this.skip('requires Node');
		}

		var filename = require.toUrl('../functional/page.html');
		var data = fs.readFileSync(filename, { encoding: 'utf8' });

		return tenon.run({
			source: data,
			sourceType: 'data',
			apiKey: '829e9d1325d5a06709996500ce953a4a',
			report: 'tenon_data.json'
		});
	}
});
