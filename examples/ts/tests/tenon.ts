import * as tenon from 'intern-a11y/tenon';
import * as path from 'path';
import { assert } from 'chai';
import { TestModuleInit } from './interfaces';

export const init: TestModuleInit = function (registerSuite) {
	registerSuite({
		name: 'tenon',

		'external url'() {
			return tenon.check({ source: 'http://google.com' })
				.catch(function (error) {
					// we expect this to fail
					assert.match(error.message, /a11y violation/);
				});
		},

		'file name'() {
			return tenon.check({ source: path.join(__dirname, 'data', 'page.html') });
		}
	});
}
