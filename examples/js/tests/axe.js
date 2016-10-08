define([
	'require',
	'intern!object',
	'intern/chai!assert',
	'intern/dojo/node!intern-a11y/aXe'
], function (
	require,
	registerSuite,
	assert,
	axe
) {
	registerSuite({
		name: 'aXe',

		'external page': function () {
			return this.remote
				.get('http://google.com')
				.sleep(2000)
				.then(axe.createChecker())
				.catch(function (error) {
					assert.match(error.message, /a11y violation/);
				});
		},

		'file name': function () {
			return axe.check({
				remote: this.remote,
				source: require.toUrl('./data/page.html')
			});
		}
	});
});
