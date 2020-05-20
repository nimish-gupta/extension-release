#!/usr/bin/env node

const meow = require('meow');

const main = require('../src/');
const { isNotNone } = require('../src/util');

const cli = meow(
	`
  Usage
    $ extension-release <options>
    --path, -p        Path of the manifest.json
    --repo, -r        Repository in which github release should be created
    --owner, -o       Owner of the repository who has push permissions
`,
	{
		flags: {
			path: {
				type: 'string',
				default: 'manifest.json',
				alias: 'p',
			},
			repo: {
				type: 'string',
				alias: 'r',
				isRequired: true,
			},
			owner: {
				type: 'string',
				alias: 'o',
				isRequired: true,
			},
		},
	}
);

const getFlagValue = (flag) => {
	if (isNotNone(cli.flags[flag])) {
		return cli.flags[flag];
	}
	if (isNotNone(cli.pkg['extension-release'])) {
		return cli.pkg['extension-release'][flag];
	}
	return undefined;
};

const options = {
	...cli.flags,
	repo: getFlagValue('repo'),
	owner: getFlagValue('owner'),
};

main(options).fork(console.error, console.log);
