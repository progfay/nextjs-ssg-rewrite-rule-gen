/**
 * @description generate {@link https://www.nginx.com/blog/creating-nginx-rewrite-rules/ | nginx rewrite rule}
 * for page files (`.html` files)
 */
export const generateNginxRewriteRule = ({
	pattern,
	filePath,
}: {
	readonly pattern: string;
	readonly filePath: string;
}) =>
	`
location ~ ${pattern} {
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
