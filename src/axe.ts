import * as fs from 'fs';
import * as Command from 'leadfoot/Command';

export interface AxeReport {
	url: string,
	timestamp: string,
	passes: AxeResult[],
	violations: AxeResult[]
}

export interface AxeTestOptions {
	/** Filename to write report file to */
	report?: string,

	config?: {
		branding?: {
			brand?: string,
			application?: string
		},
		reporter?: 'v1' | 'v2',
		checks?: {
			id: string,
			evaluate: Function,
			after?: Function,
			options?: Object,
			matches?: string,
			enabled?: boolean
		}[],
		rules?: {
			id: string,
			selector?: string,
			excludeHidden?: boolean,
			enabled?: boolean,
			pageLevel?: boolean,
			any?: string[],
			all?: string[],
			none?: string[],
			tags?: string[],
			matches?: string
		}[]
	},

	plugins?: {
		id: string,
		run: Function,
		commands: {
			id: string,
			callback: Function
		}[]
	}[]
}

export interface AxeRunTestOptions extends AxeTestOptions {
	/** LeadFoot Command object */
	remote: Command<any>,

	/** URL to load for testing */
	source: string,

	/** Number of milliseconds to wait before starting test */
	waitFor?: number
}

export function createChecker(options?: AxeTestOptions) {
	return function (this: Command<any>) {
		options = options || {};
		const axeConfig = options.config || null;
		const axePath = require.resolve('axe-core/axe.min')
		const axeScript = fs.readFileSync(axePath, { encoding: 'utf8' });

		return this.parent
			.getExecuteAsyncTimeout()
			.then(function (this: Command<any>, timeout: number) {
				return this.parent
					.setExecuteAsyncTimeout(30000)
					.execute(axeScript, [])
					.executeAsync(`return (function (config, done) {
						if (config) {
							axe.configure(config);
						}
						axe.a11yCheck(document, function(results) {
							done(results);
						});
					}).apply(this, arguments)`, [ axeConfig ])
					.then(function (report: AxeReport) {
						if (options.report) {
							fs.writeFileSync(options.report, JSON.stringify(report, null, '  '));
						}

						const numViolations = (report.violations && report.violations.length) || 0;
						let error: AxeError;
						if (numViolations == 1) {
							error = new AxeError('1 a11y violation was logged', report);
						}
						if (numViolations > 1) {
							error = new AxeError(numViolations + ' a11y violations were logged', report);
						}

						if (error) {
							throw error;
						}

						return report;
					})
					.then(
						function (this: Command<void>, report: AxeReport) {
							return this.parent
								.setExecuteAsyncTimeout(timeout)
								.then(function () {
									return report;
								});
						},
						function (this: Command<void>, error: Error) {
							return this.parent
								.setExecuteAsyncTimeout(timeout)
								.then(function () {
									throw error;
								});
						}
					);
			});
	}
}

export function check(options?: AxeRunTestOptions) {
	if (options.remote == null) {
		return Promise.reject(new Error('A remote is required when calling check()'));
	}

	let chain = options.remote.get(options.source);

	if (options.waitFor) {
		chain = chain.sleep(options.waitFor);
	}

	return chain.then(createChecker({
		report: options.report
	}));
}

interface AxeCheck {
	id: string,
	impact: string,
	message: string,
	data: string,
	relatedNodes: {
		target: string[],
		html: string
	}[]
}

interface AxeResult {
	description: string,
	help: string,
	helpUrl: string,
	id: string,
	impact: string,
	tags: string[],
	nodes: {
		html: string,
		impact: string,
		target: string[],
		any: AxeCheck[],
		all: AxeCheck[],
		none: AxeCheck[]
	}[]
}

class AxeError extends Error {
	report: AxeReport

	constructor(message?: string, report?: AxeReport) {
		super(message);
		(<any> Error).captureStackTrace(this, this.constructor);
		this.message = message;
		this.report = report;
	}
}
