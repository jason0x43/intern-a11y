intern-a11y
===========

This is a work in progress.

```
$ npm install
$ npm run build
```

Output will be generated in the `build/` directory. To clean up, run 

```
$ npm run clean
```

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
