import * as registerSuite from 'intern!object';
import * as Test from 'intern/lib/Test';
import * as assert from 'intern/chai!assert';
import * as aXe from 'intern/dojo/node!../../../../../src/aXe'
import { IRequire } from 'dojo/loader';

declare const require: IRequire;

registerSuite({
	name: 'aXe',

	'full page': function (this: Test) {
		return this.remote
			.get(require.toUrl('./page.html'))
			.sleep(2000)
			.then(aXe.createRunner())
		;
	},

	'partial page': function (this: Test) {
		return this.remote
			.get(require.toUrl('./page.html'))
			.sleep(2000)
			.then(aXe.createRunner())
		;
	}
});
