intern-a11y
===========

Accessibility testing for Intern

This is a work in progress.


Theory
------

The basic idea is to run an accessibility checker on a page, or part of a page. The checker will produce a report. This package will interpret the report and pass or fail a test.


Development
-----------

```
$ npm install
$ npm run build
```

Output will be generated in the `build/` directory. To clean up, run 

```
$ npm run clean
```

To run tests:

```
$ npm test [mode]
```

where `mode` can be `runner`, `client`, `all`, or nothing (it defaults to `client`).

Eventually it should be used something like this:

1. `npm install --save-dev intern-a11y`
2. In a test,
```js
define(function () {
	var tenon = require('intern-a11y/tenon');
	// ...
	registerSuite({
		// ...

		'a11y test': function () {
			return tenon.run({
				url: 'somewhere.com'
			});
		}
	});
});
