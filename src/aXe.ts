import * as fs from 'fs';
import * as Command from 'leadfoot/Command';

export type AxeReporterVersion = 'v1' | 'v2';

export interface AxeConfig {
	branding?: {
		brand?: string,
		application?: string
	},
	reporter?: AxeReporterVersion,
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
}

export interface AxeCheck {
	id: string,
	impact: string,
	message: string,
	data: string,
	relatedNodes: {
		target: string[],
		html: string
	}[]
}

export interface AxeResult {
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

export interface AxeReport {
	url: string,
	timestamp: string,
	passes: AxeResult[],
	violations: AxeResult[]
}

export interface AxePlugin {
	id: string,
	run: Function,
	commands: {
		id: string,
		callback: Function
	}[]
}

export interface AxeTestOptions {
	baseUrl?: string,
	report?: string,
	config?: AxeConfig,
	plugins?: AxePlugin[]
}

export function createRunner(options?: AxeTestOptions) {
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
					.execute(axeScript, null)
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

						if (report.violations && report.violations.length > 0) {
							throw new Error(report.violations.length + ' a11y violations were logged');
						}
					})
					.then(
						function (this: Command<void>) {
							return this.parent
								.setExecuteAsyncTimeout(timeout);
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
