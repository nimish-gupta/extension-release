const commandExists = require('command-exists');
const R = require('ramda');
const { Future } = require('ramda-fantasy');
const parseArgs = require('minimist');
const fs = require('fs');
const path = require('path');
const release = require('release-github');

const manifestExists = (args) =>
	new Future((reject, resolve) => {
		const filePath = path.join(__dirname, args.path);
		return fs.exists(filePath, (isExist) =>
			isExist
				? resolve({ ...args, manifestPath: filePath })
				: reject(
						`manifest.json doesn't exist. Please provide the correct path using --path argument`
				  )
		);
	});

const getExtensionVersion = (args) =>
	new Future((reject, resolve) =>
		fs.readFile(args.manifestPath, {}, (err, data) => {
			if (err) {
				return reject(`Could not read the file, due to ${err}`);
			}
			try {
				const version = JSON.parse(data)['version'];
				if (version === undefined) {
					throw new Error('Version property not found in manifest');
				}
				return resolve({ ...args, releaseVersion: version });
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
			.then(() => resolve(args))
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

const createGitRelease = (args) =>
	new Future((reject, resolve) =>
		release({
			repo: 'extension-release',
			owner: 'nimish-gupta',
			releaseVersion: args.releaseVersion,
			open: true,
		})
			.then(resolve)
			.catch(reject)
	);

const main = R.compose(
	R.chain(createGitRelease),
	R.chain(getExtensionVersion),
	R.chain(manifestExists),
	R.map(getArgs),
	checkGitExists
);

main(process.argv).fork(console.error, console.log);
