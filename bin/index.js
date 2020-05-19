const meow = require('meow');

const main = require('../index');

const isNone = (val) => val === null || val === undefined;
const isNotNone = (val) => !isNone(val);

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
			},
			owner: {
				type: 'string',
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
