import path from "node:path";
import { parseArgs } from "node:util";
import { glob } from "glob";
import { loadConfig } from "./config";
import {
	convertPageFilePathToRoute,
	generateNextjsExportedHtmlFilePath,
	generateNextjsPathPattern,
	rejectUnnecessaryRoutes,
	sortRoutesByRoutingPriorityOrder,
} from "./nextjs";
import {
	generateFallbackNginxRewriteRule,
	generateNginxRewriteRule,
} from "./nginx";

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

	const pagesFilePathPattern = path.join(
		config.pagesDirPath,
		"**/*.{js,jsx,ts,tsx}",
	);
	const pageFilePathList = await glob(pagesFilePathPattern);

	const routes = pageFilePathList.map((pageFilePath) =>
		convertPageFilePathToRoute(pageFilePath, config),
	);
	const filteredRoutes = rejectUnnecessaryRoutes(routes, config);

	const orderedRoutes = sortRoutesByRoutingPriorityOrder(filteredRoutes);

	const pageDirectives = orderedRoutes.map((route) => {
		const pattern = generateNextjsPathPattern({
			route,
			basePath: config.basePath,
		});
		const filePath = generateNextjsExportedHtmlFilePath({
			route,
			trailingSlash: config.trailingSlash,
		});
		return generateNginxRewriteRule({ pattern, filePath });
	});

	const directives = [
		...pageDirectives,
		generateFallbackNginxRewriteRule(config.basePath),
	];

	// eslint-disable-next-line no-console
	console.log(directives.join("\n\n"));
};

main();
