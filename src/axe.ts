import * as fs from 'fs';
import * as Command from 'leadfoot/Command';
import { A11yResults } from './interfaces';

export interface AxeResults {
	url: string,
	timestamp: string,
	passes: AxeResult[],
	violations: AxeResult[]
}

export function toA11yResults(results: AxeResults): A11yResults {
	return {
		source: results.url,
		violations: results.violations.map(function (violation) {
			return {
				message: violation.help,
				snippet: violation.nodes[0].html,
				description: violation.description,
				target: violation.nodes[0].target[0],
				reference: violation.helpUrl,
				tags: violation.tags
			};
		})
	}
}

export interface AxeTestOptions {
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

export class AxeError extends Error {
	results: AxeResults

	constructor(message?: string, results?: AxeResults) {
		super(message);
		(<any> Error).captureStackTrace(this, this.constructor);
		this.message = message;
		this.results = results;
	}
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
					.then(function (results: AxeResults) {
						const numViolations = (results.violations && results.violations.length) || 0;
						let error: AxeError;
						if (numViolations == 1) {
							error = new AxeError('1 a11y violation was logged', results);
						}
						if (numViolations > 1) {
							error = new AxeError(numViolations + ' a11y violations were logged', results);
						}

						if (error) {
							throw error;
						}

						return results;
					})
					.then(
						function (this: Command<void>, results: AxeResults) {
							return this.parent
								.setExecuteAsyncTimeout(timeout)
								.then(function () {
									return results;
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

	return chain.then(createChecker(options));
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
