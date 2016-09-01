import * as http from 'http';
import * as querystring from 'querystring';
import * as fs from 'fs';

export interface TenonConfig {
}

type SourceType = 'url' | 'file' | 'data';

export interface TenonSource {
	type: SourceType
	value: string
}

export interface TestOptions {
	source: TenonSource,
	apiKey: string,
	report?: string,
	config?: TenonConfig,
}

export interface TenonResults {
}

interface TenonQuery {
	key: string,
	src?: string,
	url?: string
}

export function run(options: TestOptions) {
	return new Promise(function (resolve, reject) {
		const tenonConfig = options ? options.config : null;
		let queryData: TenonQuery = {
			key: options.apiKey
		};

		if (options.source.type === 'file') {
			queryData.src = fs.readFileSync(options.source.value, { encoding: 'utf8' });
		}

		const data = querystring.stringify(queryData);

		const request = http.request({
			host: 'tenon.io',
			port: 80,
			path: '/api/',
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Content-Length': Buffer.byteLength(data)
			}
		}, function (response) {
			let responseData: string[] = [];
			response.setEncoding('utf8');
			response.on('data', function (chunk: any) {
				responseData.push(chunk);
			});
			response.on('end', function () {
				resolve(responseData.join(''));
			});
			response.on('error', function (error: Error) {
				reject(error);
			});
		});

		request.write(data);
		request.end();
	});
}
