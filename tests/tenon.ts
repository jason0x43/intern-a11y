import * as registerSuite from 'intern!object';
import * as Test from 'intern/lib/Test';
import * as assert from 'intern/chai!assert';
import * as tenon from 'intern/dojo/node!../../../../src/tenon';
import * as fs from 'intern/dojo/node!fs';
import * as util from './util';
import { IRequire } from 'dojo/loader';

declare const require: IRequire;

registerSuite({
	name: 'tenon',

	bad: (function () {
		function check(config: tenon.TenonTestOptions) {
			const resultsFile = util.cleanup(config.resultsFile);

			return tenon.check(config).then(
				function () {
					throw new Error('test should not have passed');
				},
				function (error) {
					assert.match(error.message, /\d+ a11y violation/);
					assert.isTrue(util.fileExists(resultsFile), 'expected report file to exist');
					assert.property(error, 'report', 'expected report to be attached to error');
				}
			);
		}

		return {
			'external url': function () {
				return check({
					source: 'http://google.com',
					resultsFile: 'tenon-external-bad.json'
				});
			},

			'file name': function () {
				return check({
					source: require.toUrl('./data/bad_page.html'),
					resultsFile: 'tenon-file-bad.json'
				});
			},

			'file data': function () {
				return check({
					source: fs.readFileSync(require.toUrl('./data/bad_page.html'), { encoding: 'utf8' }),
					resultsFile: 'tenon-data-bad.json'
				});
			},

			fragment: function () {
				return check({
					source: require.toUrl('./data/bad_fragment.html'),
					resultsFile: 'tenon-fragment-bad.json',
					config: { fragment: 1 }
				});
			}
		};
	})(),

	good: (function () {
		function check(config: tenon.TenonTestOptions) {
			const resultsFile = util.cleanup(config.resultsFile);

			return tenon.check(config).then(function () {
				assert.isTrue(util.fileExists(resultsFile), 'expected report file to exist');
			});
		}

		return {
			'external url': function () {
				return check({
					source: 'http://tenon.io/documentation',
					resultsFile: 'tenon-external-good.json'
				});
			},

			'file name': function () {
				return check({
					source: require.toUrl('./data/good_page.html'),
					resultsFile: 'tenon-file-good.json'
				});
			},

			fragment: function () {
				return check({
					source: require.toUrl('./data/good_fragment.html'),
					resultsFile: 'tenon-fragment-good.json',
					config: { fragment: 1 }
				});
			}
		};
	})(),

	reporting: function (this: Test) {
		return tenon.check({
			source: 'http://google.com'
		}).catch(function (error) {
			return tenon.writeHtmlReport('tenon-report.html', error.results);
		});
	}
});
