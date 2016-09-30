import * as https from 'https';
import * as querystring from 'querystring';
import * as fs from 'fs';

export interface TenonResults {
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
	resultSet: {
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
	}[],
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
	clientScriptErrors: {
		message: string,
		stacktrace: any[]
	},
	code: string,
	moreInfo: string
}

export interface TenonTestOptions {
	/** An external URL, file name, or a data string */
	source: string,

	/** tenon.io API key */
	apiKey?: string,

	/** Filename to write result data to */
	resultsFile?: string,

	/** Number of milliseconds to wait before starting test */
	waitFor?: number,

	/** Tenon configuration options */
	config?: TenonConfig
}

export function check(options: TenonTestOptions) {
	return new Promise(function (resolve, reject) {
		const tenonConfig = options.config;

		let apiKey = process.env['TENON_API_KEY'];
		if (!apiKey && options.apiKey) {
			apiKey = options.apiKey;
		}
		if (!apiKey) {
			throw new Error('tenon requires an API key');
		}

		let queryData: TenonQuery = {
			key: apiKey
		};

		// Copy user config into queryData
		for (let key in options.config) {
			(<any> queryData)[key] = (<any> options.config)[key];
		}

		const source = options.source;

		if (/^https?:\/\/\S+$/.test(source)) {
			// source is a URL
			queryData.url = source;
		}
		else if (fileExists(source)) {
			// source is a file name
			queryData.src = fs.readFileSync(source, { encoding: 'utf8' });
		}
		else {
			// source is raw data
			queryData.src = source;
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
				if (response.statusCode !== 200) {
					reject(new Error((<any> response).statusMessage));
				}
				else {
					resolve(JSON.parse(responseData.join('')));
				}
			});
			response.on('error', function (error: Error) {
				reject(error);
			});
		});

		request.write(data);
		request.end();
	}).then(function (results: TenonResults) {
		if (options.resultsFile) {
			fs.writeFileSync(options.resultsFile, JSON.stringify(results, null, '  '));
		}

		const totalErrors = results.resultSummary.issues.totalErrors;
		let error: TenonError;

		if (totalErrors == 1) {
			error = new TenonError('1 a11y violation was logged', results);
		}
		if (totalErrors > 1) {
			error = new TenonError(totalErrors + ' a11y violations were logged', results);
		}

		if (error) {
			throw error;
		}

		return results;
	});
}

function fileExists(filename: string) {
	try {
		return fs.statSync(filename).isFile();
	}
	catch (error) {
		if (error.code === 'ENOENT') {
			return false;
		}
		throw error;
	}
}

interface TenonConfig {
	certainty?: 0 | 20 | 40 | 60 | 80 | 100,
	projectID?: string,
	docID?: string,
	priority?: 0 | 20 | 40 | 60 | 80 | 100,
	level?: 'A' | 'AA' | 'AAA',
	fragment?: 0 | 1,
	store?: 0 | 1,
	uaString?: string,
	viewPortHeight?: number,
	viewPortWidth?: number,
}

interface TenonQuery extends TenonConfig {
	key: string,
	src?: string,
	url?: string
}

class TenonError extends Error {
	results: TenonResults

	constructor(message?: string, results?: TenonResults) {
		super(message);
		(<any> Error).captureStackTrace(this, this.constructor);
		this.message = message;
		this.results = results;
	}
}
