import { lstat, readFile } from "node:fs/promises";
import path from "node:path";

interface NginxConfig {
	readonly pattern: string;
	readonly directives: string[];
}

export interface Config {
	readonly pagesDirPath: string;
	readonly ignoredRoutes: readonly string[];
	readonly nginxConfigs: NginxConfig[];
	readonly basePath: string;
	readonly trailingSlash: boolean;
}

type RawConfig = Partial<Config>;

function assertNginxConfig(obj: unknown): asserts obj is NginxConfig {
	if (typeof obj !== "object" || obj === null) {
		throw new TypeError("nginxConfig must be JSON Object");
	}

	if (!("pattern" in obj) || typeof obj.pattern !== "string") {
		throw new TypeError('nginxConfig property "pattern" must be string');
	}

	try {
		new RegExp(obj.pattern);
	} catch (e) {
		if (e instanceof SyntaxError) {
			const error = new SyntaxError(
				`invalid RegExp pattern: ${JSON.stringify(obj.pattern)}`,
			);
			error.cause = e;
			throw error;
		}
	}

	if (
		!("directives" in obj) ||
		!Array.isArray(obj.directives) ||
		obj.directives.some((d) => typeof d !== "string")
	) {
		throw new TypeError(
			'nginxConfig property "directives" must be string array',
		);
	}
}

function assertRawConfig(obj: unknown): asserts obj is RawConfig {
	if (typeof obj !== "object" || obj === null) {
		throw new TypeError("config must be JSON Object");
	}

	if ("pagesDirPath" in obj) {
		if (typeof obj.pagesDirPath !== "string") {
			throw new TypeError('config property "pagesDirPath" must be string');
		}
	}

	if ("ignoredRoutes" in obj) {
		if (
			!Array.isArray(obj.ignoredRoutes) ||
			obj.ignoredRoutes.some((route) => typeof route !== "string")
		) {
			throw new TypeError(
				'config property "ignoredRoutes" must be string array',
			);
		}
	}

	if ("nginxConfigs" in obj) {
		if (!Array.isArray(obj.nginxConfigs)) {
			throw new TypeError('config property "nginxConfigs" must be array');
		}

		for (const nginxConfig of obj.nginxConfigs) {
			assertNginxConfig(nginxConfig);
		}
	}

	if ("basePath" in obj) {
		if (typeof obj.basePath !== "string") {
			throw new TypeError('config property "basePath" must be string');
		}
		if (!obj.basePath.startsWith("/")) {
			throw new TypeError('config property "basePath" must be start with "/"');
		}
	}

	if ("trailingSlash" in obj) {
		if (typeof obj.trailingSlash !== "boolean") {
			throw new TypeError('config property "trailingSlash" must be boolean');
		}
	}
}

const stat = (p: string) =>
	lstat(p)
		.then((stat) => ({ ok: true, stat }) as const)
		.catch((error) => ({ ok: false, error }) as const);

const resolvePagesDirPath = async ({
	pagesDirPath,
	configDir,
}: {
	readonly pagesDirPath: string | undefined;
	readonly configDir: string | undefined;
}): Promise<string> => {
	if (configDir !== undefined && pagesDirPath !== undefined) {
		const p = path.resolve(configDir, pagesDirPath);
		const result = await stat(p);
		if (!result.ok) throw result.error;

		if (!result.stat.isDirectory()) {
			throw new Error(`${pagesDirPath} is not directory`);
		}

		return p;
	}

	const pagesPathCandidates = [
		path.resolve("pages"),
		path.resolve("src/pages"),
	];
	for (const candidate of pagesPathCandidates) {
		const result = await stat(candidate);
		if (!result.ok) continue;

		if (result.stat.isDirectory()) return candidate;
	}

	throw new Error(
		'"pages" directory is not found. Please try to specify "pagesDirPath" config.',
	);
};

export const loadConfig = async (
	configFilePath: string | undefined,
): Promise<Required<Config>> => {
	let rawConfig: RawConfig = {};
	if (configFilePath !== undefined) {
		const content = await readFile(configFilePath, { encoding: "utf-8" });
		rawConfig = JSON.parse(content);
	}

	assertRawConfig(rawConfig);

	return {
		pagesDirPath: await resolvePagesDirPath({
			pagesDirPath: rawConfig.pagesDirPath,
			configDir: configFilePath ? path.dirname(configFilePath) : undefined,
		}),
		ignoredRoutes: rawConfig.ignoredRoutes ?? [],
		nginxConfigs: rawConfig.nginxConfigs ?? [],
		// `basePath` config is `""` by default.
		// ref. https://github.com/vercel/next.js/blob/127c5bbf80d44e256533db028d7a595a1c3defe0/packages/next/src/server/config-shared.ts#L675
		basePath: rawConfig.basePath ?? "",
		// `trailingSlash` config is `false` by default.
		// ref. https://github.com/vercel/next.js/blob/127c5bbf80d44e256533db028d7a595a1c3defe0/packages/next/src/server/config-shared.ts#L677
		trailingSlash: rawConfig.trailingSlash ?? false,
	};
};
