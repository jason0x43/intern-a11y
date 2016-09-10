import * as https from 'https';
import * as querystring from 'querystring';
import * as fs from 'fs';

export interface TenonConfig {
}

export type TenonSourceType = 'url' | 'file' | 'data';

export interface TenonResult {
	bpID: number,
	certainty: number,
	errorDescription: string,
	errorSnippet: string,
	errorTitle: string,
	issueID: string,
	position: {
		line: number,
		column: number 
	},
	priority: number,
	ref: string,
	resultTitle: string,
	signature: string,
	standards: string[],
	tID: number,
	viewPortLocation: {
		'bottom-right': {
			x: number,
			y: number 
		},
		'top-left': {
			x: number,
			y: number
		},
		height: number,
		width: number
	},
	xpath: string
}

export interface TenonError {
	message: string,
	stacktrace: any[]
}

export interface TenonReport {
	apiErrors: any[],
	documentSize: number,
	globalStats: {
		errorDensity: string,
		warningDensity: string,
		allDensity: string,
		stdDev: string
	},
	message: string,
	request: {
		url: string,
		ref: string,
		importance: string,
		responseID: string,
		userID: string,
		uaString: string,
		projectID: string,
		docID: string,
		level: string,
		certainty: number,
		priority: number,
		waitFor: string,
		fragment: number,
		store: number,
		viewport: {
			height: number,
			width: number
		}
	},
	responseExecTime: string
	responseTime: string,
	resultSet: TenonResult[],
	resultSummary: {
		density: {
			allDensity: number,
			errorDensity: number,
			warningDensity: number
		},
		issues: {
			totalErrors: number,
			totalIssues: number,
			totalWarnings: number
		},
		issuesByLevel: {
			A: {
				count: number,
				pct: number 
			},
			AA: {
				count: number,
				pct: number 
			}
			AAA: {
				count: number,
				pct: number 
			}
		},
		tests: {
			failing: number,
			passing: number,
			total: number
		}
	},
	sourceHash: string,
	status: number,
	urlHttpCode: number,
	clientScriptErrors: TenonError[],
	code: string,
	moreInfo: string
}

interface TenonQuery {
	key: string,
	src?: string,
	url?: string
}

export interface TestOptions {
	source: string,

	/** sourceType defaults to URL if not specified */
	sourceType?: string,

	/** tenon.io API key */
	apiKey: string,

	/** filename to write report file */
	report?: string,

	config?: TenonConfig,
}

export function run(options: TestOptions) {
	return new Promise(function (resolve, reject) {
		const tenonConfig = options.config;
		let queryData: TenonQuery = {
			key: options.apiKey
		};

		switch (options.sourceType) {
		case 'file':
			queryData.src = fs.readFileSync(options.source, { encoding: 'utf8' });
			break;
		case 'data':
			queryData.src = options.source;
			break;
		default:
			queryData.url = options.source;
		}

		const data = querystring.stringify(queryData);

		const request = https.request({
			host: 'tenon.io',
			path: '/api/',
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Content-Length': Buffer.byteLength(data)
			}
		}, function (response) {
			let responseData: string[] = [];
			response.setEncoding('utf8');
			response.on('data', function (chunk: string) {
				responseData.push(chunk);
			});
			response.on('end', function () {
				resolve(JSON.parse(responseData.join('')));
			});
			response.on('error', function (error: Error) {
				reject(error);
			});
		});

		request.write(data);
		request.end();
	}).then(function (report: TenonReport) {
		if (options.report) {
			fs.writeFileSync(options.report, JSON.stringify(report, null, '  '));
		}

		var totalErrors = report.resultSummary.issues.totalErrors;
		if (totalErrors > 0) {
			throw new Error(totalErrors + ' a11y violations were logged');
		}
	});
}
