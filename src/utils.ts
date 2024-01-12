export const trimPrefix = (target: string, prefix: string) =>
	target.startsWith(prefix) ? target.slice(prefix.length) : target;
