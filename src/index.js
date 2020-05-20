const commandExists = require('command-exists');
const R = require('ramda');
const { Future } = require('ramda-fantasy');
const fs = require('fs');
const path = require('path');
const release = require('release-github');

const { isNone } = require('./util');

const manifestExists = (args) =>
	new Future((reject, resolve) => {
		const filePath = path.join(process.cwd(), args.path);
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

const createGitRelease = (args) =>
	new Future((reject, resolve) =>
		release({
			repo: args.repo,
			owner: args.owner,
			releaseVersion: args.releaseVersion,
			open: true,
		})
			.then(resolve)
			.catch(reject)
	);

const requiredArgs = (keys) => (args) =>
	new Future((reject, resolve) => {
		const notPresent = keys.filter((key) => isNone(args[key]));
		if (notPresent.length === 0) {
			resolve(args);
		} else {
			reject(`Following fields are required: ${notPresent.join(', ')}`);
		}
	});
const main = R.compose(
	R.chain(createGitRelease),
	R.chain(getExtensionVersion),
	R.chain(manifestExists),
	R.chain(checkGitExists),
	requiredArgs(['repo', 'owner', 'path'])
);

module.exports = main;
