import * as fs from 'fs';
import { A11yResults, A11yViolation } from './interfaces';

export function renderReport(body: string) {
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

export function renderResults(results: A11yResults) {
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

export function renderViolation(violation: A11yViolation) {
	return `<div class="violation">
	<div class="heading">
	<div class="target">Target: <span class="selector">${escape(violation.target)}</span></div>
	<div class="message"><a href="${violation.reference}">${escape(violation.message)}</a></div>
	<div class="description">${escape(violation.description)}</div>
	</div>
	<pre class="snippet">${escape(violation.snippet)}</pre>
	</div>`;
}

export function writeReport(filename: string, results: A11yResults) {
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

function escape(string: string) {
	return String(string).replace(/</g, '&lt;');
}
