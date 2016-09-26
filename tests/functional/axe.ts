import * as registerSuite from 'intern!object';
import * as Test from 'intern/lib/Test';
import * as assert from 'intern/chai!assert';
import * as aXe from 'intern/dojo/node!../../../../../src/aXe'
import * as fs from 'intern/dojo/node!fs'
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
	name: 'aXe',

	'bad page': function (this: Test) {
		const reportFile = 'axe-bad.json';
		cleanup(reportFile);

		return this.remote
			.get(require.toUrl('../data/bad_page.html'))
			.sleep(2000)
			.then(aXe.createRunner({
				report: reportFile
			}))
			.then(
				function () {
					throw new Error('test should not have passed');
				},
				function (error) {
					assert.isTrue(fs.statSync('axe-bad.json').isFile(), 'expecetd report to exist');
				}
			)
		;
	},

	'good page': function (this: Test) {
		const reportFile = 'axe-good.json';
		cleanup(reportFile);

		return this.remote
			.get(require.toUrl('../data/good_page.html'))
			.sleep(2000)
			.then(aXe.createRunner({
				report: reportFile
			}))
			.then(function () {
				assert.isTrue(fs.statSync('axe-bad.json').isFile(), 'expecetd report to exist');
			})
		;
	}
});
