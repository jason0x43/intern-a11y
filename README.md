# intern-a11y

Accessibility testing for Intern

This is an intern plugin that adds support for accessibility testing.

## How it works

Accessibility testing works by having a scanner check a page or page fragment for rule violations. The most commonly used rules are defined in the W3C's [Web Content Accessibility Guidelines](https://www.w3.org/WAI/intro/wcag.php) (WCAG). There are twelve general WCAG guidelines at three levels of success criteria: A, AA, and AAA. Scanners can check for violations at any of the levels, and can typically be configured to only check a subset of rules.

`intern-a11y` currently supports two scanners, [aXe](https://github.com/dequelabs/axe-core) and [Tenon](https://tenon.io). aXe is a JavaScript application that must be injected into the page being tested. The application is configured and executed, returning a report describing the test results. Tenon is a cloud-based testing service; a user requests that the service test a particular URL or page source, and the service returns a report of the results.

Note that because aXe must be injected into a loaded page, it must be used with Intern's WebDriver test runner (`intern-runner`). Tenon makes HTTP calls to an external service, so it simply requires that it be used in a Node environment, and will work with the Node test client (`intern-client`) or `intern-runner`.

## Installation

The intern-a11y module should be installed as a peer of intern.

```
$ npm install intern
$ npm install intern-a11y
```

## Getting started

Using either the aXe or Tenon modules is straightforward. The simplest Tenon test looks like:

```js
'check accessibility': function () {
	return tenon.check({
		source: 'http://mypage.com'
	});
}
```

Similarly, the simplest aXe test looks like:

```js
'check accessibility': function () {
	return aXe.check({
		// aXe tests must be run in functional test suites
		remote: this.remote,
		source: require.toUrl('../data/page.html')
	});
}
```

aXe may also be used inline in a Leadfoot Command chain:

```js
'check accessibility': function () {
	return this.remote
		.get(require.toUrl('../data/page.html'))
		.then(aXe.createChecker());
}
```

In all cases, the check is asynchronous and Promise-based. If the check fails (i.e., accessibility violations are detected), the returned Promise is rejected.

## API

Importing the `intern-a11y` module will return an object with `tenon` and `axe` properties. These modules may also be individually imported as `intern-a11y/axe` and `intern-a11y/tenon`.

### axe

The aXe checker must be injected into the page being analyzed, and therefore can only be used in functional test suites, which must be run Intern's WebDriver runner, `intern-runner` (or `intern run -w` with [intern-cli](https://github.com/theintern/intern-cli)). It provides two functions, `check` and `createChecker`.

#### check

The `check` function performs a check on a given URL using a given Command object (typically `this.remote`).

```typescript
check({
	/** LeadFoot Command object */
	remote: Command<any>,

	/** URL to load for testing */
	source: string,

	/** Number of milliseconds to wait before starting test */
	waitFor?: number,

	/** aXe-specific configuration */
	config?: Object,

	/** aXe plugin definitions */
	plugins?: Object
}): Promise<AxeResults>
```

#### createChecker

The `createChecker` function returns a Leadfoot Command helper (a `then` callback). It assumes that a page has already been loaded and is ready to be tested, so it doesn't need a source or Command object.

```typescript
createChecker({
	/** aXe-specific configuration */
	config?: Object,

	/** aXe plugin definitions */
	plugins?: Object
}): Function
```

### tenon

The Tenon checker works by making requests to a remote cloud service. It can be used in functional or unit test suites. When used in unit test suites, the Tenon checker must be used with Intern's Node client, `intern-client` (or `intern run` with intern-cli).

#### check

The tenon `check` function works the same way as the axe module's, and takes a similar argument object.

```typescript
check({
	/** An external URL, file name, or a data string */
	source: string,

	/** tenon.io API key */
	apiKey?: string,

	/** Number of milliseconds to wait before starting test */
	waitFor?: number,

	/** Tenon configuration options */
	config?: TenonConfig
}): Promise<TenonResults>
```

### A11yReporter

The A11yReporter class is an Intern reporter that will write test failure detail reports to a file or directory. The `check` methods will fail if accessibility failures are present, regardless of whether the A11yReporter reporter is in use. This reporter simply outputs more detailed information for any failures that are detected.

The reporter is configured in the same way as other Intern reporters, via a reporter configuration object in the intern Test config:

```js
reporters: [
	{
		id: 'intern/dojo/node!../../../src/A11yReporter',

		// If this is a filename, all failures will be written to the given
		// file. If it's a directory name (no extension), each test failure
		// report will be written to an individual file in the given directory.
		filename: 'somereport.html'
	}
]
```

The A11yReporter class also exposes a `writeReport` static method. This method allows tests to manually write accessibility test results to a file rather than relying on the reporter:

```js
return axe.check({ ... })
	.catch(function (error) {
		var results = axe.toA11yResults(error.results);
		return A11yReporter.writeReport('some_file.html', results);
	})
```

## Development

First, clone this repo. Then:

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
$ npm test [mode] [arg [arg [...]]]
```

The optional `mode` argument can be 'runner', 'client', 'all', or 'local' (it defaults to `client`). The first three modes correspond directly to Intern test runners (runner, client, or both) and use the `tests/intern` config. `local` mode will use a `tests/intern-local` config if one is present. You can also provide standard Intern arguments like 'grep=xyz'.
