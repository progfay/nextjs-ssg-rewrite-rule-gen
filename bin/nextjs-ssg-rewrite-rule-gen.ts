#!/usr/bin/env node

import { parseArgs } from "node:util";
import { generateNextjsSSGRewriteRule, loadConfig } from "../src/index.ts";

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
