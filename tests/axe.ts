import * as registerSuite from 'intern!object';
import * as Test from 'intern/lib/Test';
import * as assert from 'intern/chai!assert';
import * as aXe from 'intern/dojo/node!../../../../src/aXe'
import * as fs from 'intern/dojo/node!fs'
import * as util from './util';
import { IRequire } from 'dojo/loader';

declare const require: IRequire;

registerSuite({
	name: 'aXe',

	bad: (function () {
		function check(reportFile: string, promise: Promise<aXe.AxeReport>) {
			return promise.then(
				function () {
					throw new Error('test should not have passed');
				},
				function (error) {
					if (reportFile) {
						assert.isTrue(util.fileExists(reportFile), 'expected report file to exist');
					}
				}
			);
		}
		
		return {
			Command: function (this: Test) {
				const reportFile = util.cleanup('axe-leadfoot-bad.json');

				return check(reportFile, this.remote
					.get(require.toUrl('./data/bad_page.html'))
					.sleep(2000)
					.then(aXe.createChecker({
						report: reportFile
					}))
				);
			},

			standalone: function (this: Test) {
				const reportFile = util.cleanup('axe-standalone-bad.json');

				return check(reportFile, aXe.check({
					source: require.toUrl('./data/bad_page.html'),
					remote: this.remote,
					report: reportFile,
					waitFor: 2000
				}));
			},

			'missing remote': function () {
				return check(null, aXe.check({
					source: require.toUrl('./data/good_page.html'),
					remote: null
				}));
			}
		};
	})(),

	good: (function () {
		function check(reportFile: string, promise: Promise<aXe.AxeReport>) {
			return promise.then(function () {
				assert.isTrue(util.fileExists(reportFile), 'expected report file to exist');
			});
		}
		
		return {
			Command: function (this: Test) {
				const reportFile = util.cleanup('axe-leadfoot-good.json');

				return check(reportFile, this.remote
					.get(require.toUrl('./data/good_page.html'))
					.sleep(2000)
					.then(aXe.createChecker({
						report: reportFile
					}))
				);
			},

			standalone: function (this: Test) {
				const reportFile = util.cleanup('axe-standalone-good.json');

				return check(reportFile, aXe.check({
					source: require.toUrl('./data/good_page.html'),
					remote: this.remote,
					report: reportFile,
					waitFor: 2000
				}));
			}
		};
	})()
});
