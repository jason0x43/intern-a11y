import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import * as tenon from 'intern/dojo/node!../../../../../src/tenon';
import * as fs from 'intern/dojo/node!fs';

import { IRequire } from 'dojo/loader';
declare const require: IRequire;

registerSuite({
	name: 'unit/tenon',

	toA11yResults() {
		const data = fs.readFileSync(require.toUrl('../data/tenon_results.json'), { encoding: 'utf8' });
		const results = <tenon.TenonResults> JSON.parse(data);
		const a11yResults = tenon.toA11yResults(results);
		assert.lengthOf(a11yResults.violations, 5, 'unexpected number of violations');
	}
});
