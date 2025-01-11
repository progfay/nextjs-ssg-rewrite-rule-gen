import path from "node:path";
import { glob } from "glob";
import type { Config } from "./config";
import {
	convertPageFilePathToRoute,
	generateNextjsExportedHtmlFilePath,
	generateNextjsPathPattern,
	rejectUnnecessaryRoutes,
	sortRoutesByRoutingPriorityOrder,
} from "./nextjs";
import { generateNginxRewriteRule } from "./nginx";

export { loadConfig } from "./config";

export const generateNextjsSSGRewriteRule = async (
	config: Config,
): Promise<string> => {
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

	const rewriteRules = orderedRoutes.map((route) => {
		const pattern = generateNextjsPathPattern({
			route,
			basePath: config.basePath,
		});
		const filePath = generateNextjsExportedHtmlFilePath({
			route,
			trailingSlash: config.trailingSlash,
		});

		const additionalDirectives = config.nginxConfigs
			.filter((nginxConfig) => new RegExp(nginxConfig.pattern).test(route))
			.flatMap((nginxConfig) => nginxConfig.directives);

		return generateNginxRewriteRule({
			pattern,
			filePath,
			additionalDirectives,
		});
	});

	return rewriteRules.join("\n\n");
};
