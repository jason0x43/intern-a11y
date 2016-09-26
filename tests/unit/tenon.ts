import * as registerSuite from 'intern!object';
import * as Test from 'intern/lib/Test';
import * as assert from 'intern/chai!assert';
import * as tenon from 'intern/dojo/node!../../../../../src/tenon';
import * as fs from 'intern/dojo/has!host-node?intern/dojo/node!fs';
import { IRequire } from 'dojo/loader';

declare const require: IRequire;

function cleanup(filename: string) {
	try {
		fs.statSync(filename);
		fs.unlinkSync(filename);
	}
	catch (error) {
		if (error.code !== 'ENOENT') {
			throw error;
		}
	}
}

registerSuite({
	name: 'tenon',

	bad: {
		'external url': function () {
			return tenon.run({
				source: 'http://google.com',
				report: 'tenon_url.json'
			}).then(
				function () {
					throw new Error('test should not have passed');
				},
				function (error) {
					assert.match(error.message, /\d+ a11y violation/);
				}
			);
		},

		'file name': function () {
			return tenon.run({
				source: require.toUrl('../data/bad_page.html'),
				report: 'tenon_file.json'
			}).then(
				function () {
					throw new Error('test should not have passed');
				},
				function (error) {
					assert.match(error.message, /\d+ a11y violation/);
				}
			);
		},

		'file data': function () {
			var filename = require.toUrl('../data/bad_page.html');
			var data = fs.readFileSync(filename, { encoding: 'utf8' });

			return tenon.run({
				source: data,
				report: 'tenon_data.json'
			}).then(
				function () {
					throw new Error('test should not have passed');
				},
				function (error) {
					assert.match(error.message, /\d+ a11y violation/);
				}
			);
		}
	},

	good: {
		'external url': function () {
			return tenon.run({
				source: 'http://tenon.io',
				report: 'tenon_url.json'
			}).then(
				function () {
					throw new Error('test should not have passed');
				},
				function (error) {
					assert.match(error.message, /\d+ a11y violation/);
				}
			);
		},

		'file name': function () {
			return tenon.run({
				source: require.toUrl('../data/good_page.html')
			});
		}
	}
});
