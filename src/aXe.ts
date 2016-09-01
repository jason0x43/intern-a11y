export interface AxeConfig {
	branding?: any,
	reporter?: string,
	checks?: Object[],
	rules?: Object[]
}

export interface TestOptions {
	report?: string,
	config?: AxeConfig,
}

export interface AxeResults {
	url: string,
	timestamp: string,
	passes: Object[],
	violations: Object[]
}

export function createRunner(testOptions?: TestOptions) {
	return function () {
		var axeConfig = testOptions ? testOptions.config : null;

		return this.parent
			.executeAsync(`function (done) {
				var script = document.createElement('script');
				script.onload = function() {
					done();
				};
				script.src = "node_modules/axe-core/axe.js";
				document.getElementsByTagName('head')[0].appendChild(script);
			}`)
			.executeAsync(`function (config done) {
				if (config) {
					axe.configure(config);
				}
				axe.a11yCheck(document, function(results) {
					done(results);
				});
			}`, [ axeConfig ])
			.then(function (results: Object) {
			});
	}
}
