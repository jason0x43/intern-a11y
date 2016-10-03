import * as registerSuite from 'intern!object';
import * as Test from 'intern/lib/Test';
import * as assert from 'intern/chai!assert';
import * as axe from 'intern/dojo/node!../../../../../src/axe'
import * as fs from 'intern/dojo/node!fs'

import A11yReporter = require('intern/dojo/node!../../../../src/A11yReporter');

import { IRequire } from 'dojo/loader';
declare const require: IRequire;

registerSuite({
	name: 'integration/aXe',

	bad: (function () {
		function check(promise: Promise<axe.AxeResults>) {
			return promise.then(
				function () {
					throw new Error('test should not have passed');
				},
				function () {
					// consume error
				}
			);
		}
		
		return {
			Command(this: Test) {
				return check(this.remote
					.get(require.toUrl('../data/bad_page.html'))
					.sleep(2000)
					.then(axe.createChecker())
				);
			},

			standalone(this: Test) {
				return check(axe.check({
					source: require.toUrl('../data/bad_page.html'),
					remote: this.remote,
					waitFor: 2000
				}));
			},

			'missing remote'() {
				return check(axe.check({
					source: require.toUrl('../data/good_page.html'),
					remote: null
				}));
			}
		};
	})(),

	good: (function () {
		return {
			Command(this: Test) {
				return this.remote
					.get(require.toUrl('../data/good_page.html'))
					.sleep(2000)
					.then(axe.createChecker());
			},

			standalone(this: Test) {
				return axe.check({
					source: require.toUrl('../data/good_page.html'),
					remote: this.remote,
					waitFor: 2000
				});
			}
		};
	})()
});
