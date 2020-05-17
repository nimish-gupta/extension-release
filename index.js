const commandExists = require('command-exists');
const R = require('ramda');
const { Future } = require('ramda-fantasy');
const parseArgs = require('minimist');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

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
	new Future((reject, resolve) =>
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
const doesTagExist = (msg) =>
	msg.indexOf('No names found, cannot describe anything.') !== -1;

const matchTag = (version) =>
	new Future((reject, resolve) =>
		exec('git describe', (err, stdout) => {
			if (err instanceof Error) {
				if (doesTagExist(err.message)) {
					resolve({ latest: undefined, version });
				} else {
					reject(err);
				}
			} else {
				resolve({ latest: stdout.trim(), version });
			}
		})
	);

const getCommitRange = ({ latest, version }) =>
	new Future(async (reject, resolve) => {
		let start = latest,
			end = `v${version}`;
		if (latest === undefined) {
			return exec('git rev-list --max-parents=0 HEAD', (err, stdout) => {
				if (err instanceof Error) {
					reject(err);
				} else {
					resolve({ start: stdout.trim(), end });
				}
			});
		}
		resolve({ start, end });
	});

const createEndTag = ({ start, end }) =>
	new Future((reject, resolve) =>
		exec(`git tag -a ${end} -m ${end}`, (err) => {
			if (err instanceof Error) {
				reject(err);
			} else {
				resolve({ start, end });
			}
		})
	);

const createGitRelease = () => {};

const main = R.compose(
	R.chain(createGitRelease),
	R.chain(createEndTag),
	R.chain(getCommitRange),
	R.chain(matchTag),
	R.chain(getExtensionVersion),
	R.chain(manifestExists),
	R.map(R.prop('path')),
	R.map(getArgs),
	checkGitExists
);

main(process.argv).fork(console.error, console.log);
