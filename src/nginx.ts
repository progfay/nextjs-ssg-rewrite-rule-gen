import { Config } from "./config";

/**
 * @description generate {@link https://www.nginx.com/blog/creating-nginx-rewrite-rules/ | nginx rewrite rule}
 * for page files (`.html` files)
 */
export const generateNginxRewriteRule = ({
	pattern,
	filePath,
	additionalDirectives,
}: {
	readonly pattern: string;
	readonly filePath: string;
	readonly additionalDirectives: string[];
}) =>
	`
location ~ ${pattern} {${
		additionalDirectives.length > 0
			? `\n  ${additionalDirectives.join("\n  ")}`
			: ""
	}
  rewrite ${pattern} ${filePath} break;
}
`.trim();

/**
 * @description generate {@link https://www.nginx.com/blog/creating-nginx-rewrite-rules/ | nginx rewrite rule}
 * for non-page files (assets other than `.html` files)
 */
export const generateFallbackNginxRewriteRule = (basePath: string) =>
	`
location / {
  rewrite ^${basePath}/(.*)$ /$1 break;
}
`.trim();
