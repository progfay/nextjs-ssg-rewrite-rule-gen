import { lstat, readFile } from "node:fs/promises";
import path from "node:path";

export interface Config {
	readonly pagesDirPath: string;
	readonly ignoredRoutes: readonly string[];
	readonly basePath: string;
	readonly trailingSlash: boolean;
}

type RawConfig = Partial<Config>;

function assertRawConfig(obj: unknown): asserts obj is RawConfig {
	if (typeof obj !== "object" || obj === null) {
		throw new Error("config must be JSON");
	}

	if ("pagesDirPath" in obj) {
		if (typeof obj.pagesDirPath !== "string") {
			throw new Error('config must have string field "pagesDirPath"');
		}
	}

	if ("ignoredRoutes" in obj) {
		if (
			!Array.isArray(obj.ignoredRoutes) ||
			obj.ignoredRoutes.some((route) => typeof route !== "string")
		) {
			throw new Error('config must have string array field "ignoredRoutes"');
		}
	}

	if ("basePath" in obj) {
		if (typeof obj.basePath !== "string") {
			throw new Error('"basePath" config must be string');
		}
		if (obj.basePath.startsWith("/")) {
			throw new Error('"basePath" config must be start with "/"');
		}
	}

	if ("trailingSlash" in obj) {
		if (typeof obj.trailingSlash !== "boolean") {
			throw new Error('"trailingSlash" config must be boolean');
		}
	}
}

const stat = (p: string) =>
	lstat(p)
		.then((stat) => ({ ok: true, stat }) as const)
		.catch((error) => ({ ok: false, error }) as const);

export const resolvePagesDirPath = async ({
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
		// `basePath` config is `""` by default.
		// ref. https://github.com/vercel/next.js/blob/127c5bbf80d44e256533db028d7a595a1c3defe0/packages/next/src/server/config-shared.ts#L675
		basePath: "",
		// `trailingSlash` config is `false` by default.
		// ref. https://github.com/vercel/next.js/blob/127c5bbf80d44e256533db028d7a595a1c3defe0/packages/next/src/server/config-shared.ts#L677
		trailingSlash: rawConfig.trailingSlash ?? false,
	};
};
