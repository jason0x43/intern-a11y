import * as fs from 'fs'

export interface A11yResults {
	source: string,
	violations: {
		message: string,
		snippet: string,
		description: string,
		target: string,
		reference: string,
		tags: string[]
	}[]
}

export function writeFile(filename: string, results: A11yResults) {
	return new Promise(function (resolve, reject) {
		var out = [
			'<DOCTYPE! html>',
			'<html lang="en">',
			'<head><title>A11y report</title></head>',
			'<style>',
			'html {font-family:sans-serif;}',
			'.violation {border:solid 1px #bbb;width:800px;margin-bottom:1em;}',
			'.heading {padding: 0.5em;}',
			'.heading > * {margin-bottom:0.5em;}',
			'.heading > *:last-child {margin-bottom:0;}',
			'.description {font-style:italic;color:#999;}',
			'.target .selector {color:#999}',
			'.snippet {padding:0.5em;margin:0;background:#f0f0f0;overflow:auto;}',
			'</style>',
			'<body>'
		];

		if (/^https?:\/\//.test(results.source)) {
			out.push(`<h1><a href="${results.source}">${results.source}</a></h1>`);
		}
		else {
			out.push(`<h1>${results.source}</h1>`);
		}

		out.push('<h2>Violations</h2>');
		results.violations.forEach(function (violation) {
			out.push('<div class="violation">');
			out.push('<div class="heading">');
			out.push(`<div class="target">Target: <span class="selector">${escape(violation.target)}</span></div>`);
			out.push(`<div class="message"><a href="${violation.reference}">${escape(violation.message)}</a></div>`);
			out.push(`<div class="description">${escape(violation.description)}</div>`);
			out.push('</div>');
			out.push(`<pre class="snippet">${escape(violation.snippet)}</pre>`);
			out.push('</div>');
		});

		fs.writeFile(filename, out.join(''), function (error) {
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
