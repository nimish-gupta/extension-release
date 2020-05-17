const commandExists = require('command-exists');
const git = require('simple-git');
const R = require('ramda');
const { Future } = require('ramda-fantasy');
const parseArgs = require('minimist');
const fs = require('fs');
const path = require('path');

const manifestExists = (argPath) =>
	new Future((reject, resolve) => {
		const filePath = path.join(__dirname, argPath);
		return fs.exists(filePath, (isExist) =>
			isExist
				? resolve(filePath)
				: reject(
						`manifest.json doesn't exist. Please provide the correct path using --path argument`
				  )
		);
	});

const getExtensionVersion = (filePath) =>
	new Future((resolve, reject) =>
		fs.readFile(filePath, {}, (err, data) => {
			if (err) {
				return reject(`Could not read the file, due to ${err}`);
			}
			try {
				const version = JSON.parse(data)['version'];
				if (version === undefined) {
					throw new Error('Version property not found in manifest');
				}
				return resolve(version);
			} catch (error) {
				return reject(
					`manifest.json could not be parsed, due to ${error.message}`
				);
			}
		})
	);

const checkGitExists = (args) =>
	new Future((reject, resolve) =>
		commandExists('git')
			.then((data) => resolve(args))
			.catch(() => reject('git command not found'))
	);

const getArgs = (args) =>
	parseArgs(args, {
		alias: {
			path: ['p'],
		},
		default: {
			path: 'manifest.json',
		},
	});

const main = R.compose(
	R.chain(getExtensionVersion),
	R.chain(manifestExists),
	R.map(R.prop('path')),
	R.map(getArgs),
	checkGitExists
);
main(process.argv).fork(console.error, console.log);
