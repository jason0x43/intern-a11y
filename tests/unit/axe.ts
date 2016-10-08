import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import * as axe from 'intern/dojo/node!../../../../../src/axe'
import * as fs from 'intern/dojo/node!fs'
import { A11yResults } from 'intern/dojo/node!../../../../../src/interfaces';
import { IRequire } from 'dojo/loader';

declare const require: IRequire;

registerSuite({
	name: 'unit/aXe',

	toA11yResults() {
		const data = fs.readFileSync(require.toUrl('../data/axe_results.json'), { encoding: 'utf8' });
		const results: any = JSON.parse(data);
		const a11yResults = axe.toA11yResults(results);
		assert.lengthOf(a11yResults.violations, 2, 'unexpected number of violations');
	}
});
