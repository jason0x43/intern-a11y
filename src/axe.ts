import * as fs from 'fs';
import * as Command from 'leadfoot/Command';
import { A11yResults, A11yError } from './interfaces';

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

	// The scope to be analyzed (i.e., a selector for a portion of a document); defaults to the entire document
	context?: string
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
		const axePath = require.resolve('axe-core/axe.min')
		const axeScript = fs.readFileSync(axePath, { encoding: 'utf8' });
		const axeContext = options.context;

		const config = options.config;
		let axeConfig: AxeConfig = null;

		if (config) {
			axeConfig = {
				branding: config.branding,
				reporter: config.reporter,
				rules: config.rules
			};
			if (config.checks) {
				axeConfig.checks = config.checks.map(function (check) {
					return {
						id: check.id,
						evaluate: check.evaluate.toString(),
						after: check.after ? check.after.toString() : undefined,
						options: check.options,
						matches: check.matches,
						enabled: check.enabled
					};
				});
			}
		}

		return this.parent
			.getExecuteAsyncTimeout()
			.then(function (this: Command<any>, timeout: number) {
				return this.parent
					.setExecuteAsyncTimeout(30000)
					.execute(axeScript, [])
					.executeAsync(`return (function (config, context, done) {
						if (config) {
							if (config.checks) {
								config.checks.forEach(function (check) {
									eval('check.evaluate = ' + check.evaluate);
									if (check.after) {
										eval('check.after = ' + check.after);
									}
								});
							}
							axe.configure(config);
						}
						if (!context) {
							context = document;
						}
						axe.a11yCheck(context, function(results) {
							done(results);
						});
					}).apply(this, arguments)`, [ axeConfig, axeContext ])
					.then(function (results: AxeResults) {
						const a11yResults = toA11yResults(results);

						const numViolations = (results.violations && results.violations.length) || 0;
						let error: A11yError;
						if (numViolations == 1) {
							error = new A11yError('1 a11y violation was logged', a11yResults);
						}
						if (numViolations > 1) {
							error = new A11yError(numViolations + ' a11y violations were logged', a11yResults);
						}

						if (error) {
							throw error;
						}

						return a11yResults;
					})
					.then(
						function (this: Command<void>, results: A11yResults) {
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

export function toA11yResults(axeResults: any): A11yResults {
	return {
		analyzer: 'axe',
		source: axeResults.url,
		violations: axeResults.violations.map(function (violation: any) {
			let standards: string[] = [];
			let wcagLevel = '';

			if (violation.tags.indexOf('wcag2a') !== -1) {
				wcagLevel = 'A';
			}
			else if (violation.tags.indexOf('wcag2aa') !== -1) {
				wcagLevel = 'AA';
			}
			else if (violation.tags.indexOf('wcag2aaa') !== -1) {
				wcagLevel = 'AAA';
			}

			// WCAG tags
			violation.tags.filter(function (tag: any) {
				return /wcag\d+$/.test(tag);
			}).forEach(function (tag: any) {
				var section = tag.slice(4).split('').join('.');
				standards.push(`Web Content Accessibility Guidelines (WCAG) 2.0, Level ${wcagLevel}: ${section}`);
			});

			// Section 508 tags
			violation.tags.filter(function (tag: any) {
				return /section508\..*/.test(tag);
			}).forEach(function (tag: any) {
				standards.push(`Section 508: 1194.${tag.slice('section508.'.length)}`);
			});

			return {
				message: violation.help,
				snippet: violation.nodes[0].html,
				description: violation.description,
				target: violation.nodes[0].target[0],
				reference: violation.helpUrl,
				standards: standards
			};
		}),
		originalResults: axeResults
	}
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

interface AxeConfig {
	branding?: {
		brand?: string,
		application?: string
	},
	reporter?: 'v1' | 'v2',
	checks?: {
		id: string,
		evaluate: string,
		after?: string,
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

interface AxeResults {
	url: string,
	timestamp: string,
	passes: AxeResult[],
	violations: AxeResult[]
}
