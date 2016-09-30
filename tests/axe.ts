import * as registerSuite from 'intern!object';
import * as Test from 'intern/lib/Test';
import * as assert from 'intern/chai!assert';
import * as axe from 'intern/dojo/node!../../../../src/axe'
import * as fs from 'intern/dojo/node!fs'
import * as util from './util';
import { IRequire } from 'dojo/loader';

declare const require: IRequire;

registerSuite({
	name: 'aXe',

	bad: (function () {
		function check(resultsFile: string, promise: Promise<axe.AxeResults>) {
			return promise.then(
				function () {
					throw new Error('test should not have passed');
				},
				function (error) {
					if (resultsFile) {
						assert.isTrue(util.fileExists(resultsFile), 'expected report file to exist');
					}
				}
			);
		}
		
		return {
			Command: function (this: Test) {
				const resultsFile = util.cleanup('axe-leadfoot-bad.json');

				return check(resultsFile, this.remote
					.get(require.toUrl('./data/bad_page.html'))
					.sleep(2000)
					.then(axe.createChecker({
						resultsFile: resultsFile
					}))
				);
			},

			standalone: function (this: Test) {
				const resultsFile = util.cleanup('axe-standalone-bad.json');

				return check(resultsFile, axe.check({
					source: require.toUrl('./data/bad_page.html'),
					remote: this.remote,
					resultsFile: resultsFile,
					waitFor: 2000
				}));
			},

			'missing remote': function () {
				return check(null, axe.check({
					source: require.toUrl('./data/good_page.html'),
					remote: null
				}));
			}
		};
	})(),

	good: (function () {
		function check(resultsFile: string, promise: Promise<axe.AxeResults>) {
			return promise.then(function () {
				assert.isTrue(util.fileExists(resultsFile), 'expected report file to exist');
			});
		}
		
		return {
			Command: function (this: Test) {
				const resultsFile = util.cleanup('axe-leadfoot-good.json');

				return check(resultsFile, this.remote
					.get(require.toUrl('./data/good_page.html'))
					.sleep(2000)
					.then(axe.createChecker({
						resultsFile: resultsFile
					}))
				);
			},

			standalone: function (this: Test) {
				const resultsFile = util.cleanup('axe-standalone-good.json');

				return check(resultsFile, axe.check({
					source: require.toUrl('./data/good_page.html'),
					remote: this.remote,
					resultsFile: resultsFile,
					waitFor: 2000
				}));
			}
		};
	})()
});
