import * as Test from 'intern/lib/Test';
import * as axe from './axe';
import * as tenon from './tenon';
import * as path from 'path';
import * as fs from 'fs';
import { A11yResults, A11yViolation } from './interfaces';

class A11yReporter {
	config: any;

	filename: string;

	report: string[];

	constructor(config: any) {
		this.config = config;
		this.filename = this.config.filename;

		if (!this.filename) {
			this.filename = 'a11y-report';
		}

		if (/\.html$/.test(this.filename)) {
			this.report = [];
		}
		else {
			// ReporterManager will already have created dirname(this.config.filename)
			try {
				fs.mkdirSync(this.filename);
			}
			catch (error) {
				if (error.code !== 'EEXIST') {
					throw error;
				}
			}
		}
	}

	testFail(test: Test) {
		const error = test.error;
		let results: A11yResults;

		if (error instanceof axe.AxeError) {
			results = axe.toA11yResults(error.results);
		}
		else if (error instanceof tenon.TenonError) {
			results = tenon.toA11yResults(error.results);
		}

		if (results) {
			const content = renderResults(results);

			if (this.report) {
				this.report.push(content);
			}
			else {
				const filename = path.join(this.filename, sanitizeFilename(test.id + '.html')); 
				fs.writeFileSync(filename, renderReport(content));
			}
		}
	}

	runEnd() {
		if (this.report) {
			fs.writeFileSync(this.filename, renderReport(this.report.join('')));
		}
	}

	static writeReport(filename: string, results: A11yResults) {
		return new Promise(function (resolve, reject) {
			const content = renderResults(results);
			fs.writeFile(filename, renderReport(content), function (error) {
				if (error) {
					reject(error);
				}
				else {
					resolve(results);
				}
			});
		});
	}
}

function escape(string: string) {
	return String(string).replace(/</g, '&lt;');
}

function renderReport(body: string) {
	return `<DOCTYPE! html>
	<html lang="en">
		<head>
		<title>Accessibility Report</title>
			<style>
				html { font-family:sans-serif; }
				.violation { border: solid 1px #bbb; width: 800px; margin-bottom: 1em; }
				.heading { padding: 0.5em; }
				.heading > * { margin-bottom: 0.5em; }
				.heading > *: last-child { margin-bottom: 0; }
				.description { font-style: italic;color: #999; }
				.target .selector {color: #999}
				.snippet { padding: 0.5em;margin: 0;background: #f0f0f0;overflow: auto; }
			</style>
		</head>
		<body>
		${body}
		</body>
	</html>`
}

function renderResults(results: A11yResults) {
	let out: string[] = [];

	if (/^https?:\/\//.test(results.source)) {
		out.push(`<h1><a href="${results.source}">${results.source}</a></h1>`);
	}
	else {
		out.push(`<h1>${results.source}</h1>`);
	}

	if (results.violations.length > 0) {
		out.push('<h2>Violations</h2>');
		return out.concat(results.violations.map(renderViolation)).join('');
	}

	return out.concat('<h2>No violations</h2>').join('');
}

function renderViolation(violation: A11yViolation) {
	return `<div class="violation">
	<div class="heading">
	<div class="target">Target: <span class="selector">${escape(violation.target)}</span></div>
	<div class="message"><a href="${violation.reference}">${escape(violation.message)}</a></div>
	<div class="description">${escape(violation.description)}</div>
	</div>
	<pre class="snippet">${escape(violation.snippet)}</pre>
	</div>`;
}

function sanitizeFilename(filename: string) {
	return filename
		.replace(/[/?<>\\:*|"]/g, '_')
		.replace(/[.\s]+$/, '');
}

// Use TS default export for improved CJS interop
export = A11yReporter;
