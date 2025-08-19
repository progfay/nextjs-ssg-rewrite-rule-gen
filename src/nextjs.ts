/**
 * This code supports Next.js {@link https://nextjs.org/docs/pages | Pages Router} only,
 * and doesn't support {@link https://nextjs.org/docs/pages/building-your-application/routing/dynamic-routes#catch-all-segments | Catch-all Segments}
 * and {@link https://nextjs.org/docs/pages/building-your-application/routing/dynamic-routes#optional-catch-all-segments | Optional Catch-all Segments}
 */

import type { Config } from "./config";

declare const routeSymbol: unique symbol;
/**
 * @description `Route` is path type which is treated on Next.js.
 * `Route` doesn't include `basePath`, `locale` and trailing slash
 * like a {@link https://github.com/vercel/next.js/blob/127c5bbf80d44e256533db028d7a595a1c3defe0/docs/03-pages/02-api-reference/02-functions/use-router.mdx#L39 | `NextRouter["pathname"]`}
 */
export type Route = string & {
	__route: typeof routeSymbol;
};

/**
 * @see {@link https://github.com/vercel/next.js/blob/127c5bbf80d44e256533db028d7a595a1c3defe0/docs/03-pages/01-building-your-application/03-data-fetching/06-building-forms.mdx#L168}
 */
const API_ROUTE_PREFIX = "/api/";

/**
 * @param pageFilePath
 * @returns is the argument {@link https://nextjs.org/docs/pages/building-your-application/routing/api-routes | API Routes} or not
 * @private
 */
const isApiRoutePath = (route: Route) => route.startsWith(API_ROUTE_PREFIX);

/**
 * Each `Route` has priority because {@link https://nextjs.org/docs/pages/building-your-application/routing/dynamic-routes | Dynamic Routes} is exists.
 * For example, the pages `/user/[id]`, `/user/new` is exists,
 * user will navigate for the latter one when user access to the path: `/user/new`.
 * In Next.js, this process is implemented as {@link https://github.com/vercel/next.js/blob/127c5bbf80d44e256533db028d7a595a1c3defe0/packages/next/src/shared/lib/router/utils/sorted-routes.ts#L198 | `getSortedRoutes` function}.
 * The behavior of `getSortedRoutes` function can be understood from the {@link https://github.com/vercel/next.js/blob/127c5bbf80d44e256533db028d7a595a1c3defe0/test/unit/page-route-sorter.test.ts#L19-L67 | test code}.
 * @param routes
 * @returns `Route` array which is sorted by priority (descending)
 */
export const sortRoutesByRoutingPriorityOrder = (routes: Route[]): Route[] =>
	[...routes].sort((file1: Route, file2: Route) => {
		const minLength = Math.min(file1.length, file2.length);
		for (let i = 0; i < minLength; i += 1) {
			if (file1[i] === file2[i]) continue; // eslint-disable-line no-continue

			// without Dynamic Routes has a higher priority than with Dynamic Routes
			if (file1[i] === "[") return 1;
			if (file2[i] === "[") return -1;

			// ref. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/localeCompare
			return file1[i].localeCompare(file2[i]);
		}

		// the shorter the path, the higher the priority.
		return file1.length - file2.length;
	});

const trimPrefix = (target: string, prefix: string) =>
	target.startsWith(prefix) ? target.slice(prefix.length) : target;

/**
 * @param pageFilePath path for file under the `pages` directory
 * @returns converted argument for {@link Route}
 */
export const convertPageFilePathToRoute = (
	absolutePageFilePath: string,
	{ pagesDirPath }: Pick<Config, "pagesDirPath">,
): Route => {
	const pageFilePath = trimPrefix(absolutePageFilePath, pagesDirPath);
	const route = pageFilePath
		.replace(/\.(js|jsx|ts|tsx)$/, "")
		.replace(/\/index$/, "") as Route;
	return route;
};

const COMMON_IGNORED_ROUTES = [
	"/_app",
	"/_document",
	"/_error",
	"/404",
	"/500",
];

/**
 * @description reject API Routes and routes which should be ignored.
 */
export const rejectUnnecessaryRoutes = (
	routes: Route[],
	{ ignoredRoutes }: Pick<Config, "ignoredRoutes">,
): Route[] =>
	routes
		.filter((route) => !isApiRoutePath(route))
		.filter((route) => !COMMON_IGNORED_ROUTES.includes(route))
		.filter((route) => !ignoredRoutes.includes(route))
		.filter((route) => {
			// Catch-all Segments are not supported.
			const CATCH_ALL_SEGMENTS_REGEXP: RegExp = /\[\.\.\.[^/]+?\]/g
			return !CATCH_ALL_SEGMENTS_REGEXP.test(route)
		})
		.filter((route) => {
			// Optional Catch-all Segments are not supported.
			const OPTIONAL_CATCH_ALL_SEGMENTS_REGEXP: RegExp = /\[\[\.\.\.[^/]+?\]\]/g
			return !OPTIONAL_CATCH_ALL_SEGMENTS_REGEXP.test(route)
		});

/**
 * @description generate regular expression string which matches to `pathname`
 */
export const generateNextjsPathPattern = ({
	route,
	basePath,
}: {
	readonly route: Route;
	readonly basePath: string;
}) => `^${`${basePath}${route}`.replace(/\[[^/]+?\]/g, "[^/]+?")}/?$`;

/**
 * @returns paths for HTML file generated with {@link https://nextjs.org/docs/pages/building-your-application/deploying/static-exports | Next.js Static Exports}
 */
export const generateNextjsExportedHtmlFilePath = ({
	route,
	trailingSlash,
}: {
	readonly route: Route;
	readonly trailingSlash: boolean;
}) => {
	if (route === "") return "/index.html";

	/**
	 * The path depends on {@link https://nextjs.org/docs/app/api-reference/next-config-js/trailingSlash `NextConfig["trailingSlash"]` option}.
	 */
	return trailingSlash ? `${route}/index.html` : `${route}.html`;
};
