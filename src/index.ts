import * as _axe from './services/axe';
import * as _tenon from './services/tenon';

export const services = {
	axe: _axe,
	tenon: _tenon 
};

import _A11yReporter = require('./A11yReporter');
export let A11yReporter = _A11yReporter;

export * from './common';
