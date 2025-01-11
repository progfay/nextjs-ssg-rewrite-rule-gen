#!/usr/bin/env node

const { parseArgs } = require("node:util");
const {
	loadConfig,
	generateNextjsSSGRewriteRule,
} = require("../dist/index.js");

const main = async () => {
	const {
		values: { config: configFilePath },
	} = parseArgs({
		args: process.argv.slice(2),
		options: {
			config: {
				type: "string",
			},
		},
	});

	const config = await loadConfig(configFilePath);

	const rule = await generateNextjsSSGRewriteRule(config);

	console.log(rule);
};

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
