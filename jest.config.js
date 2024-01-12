module.exports = {
	testMatch: ["<rootDir>/**/*.test.ts"],
	transform: {
		"^.+\\.(js|jsx|ts|tsx)$": "@swc/jest",
	},
	transformIgnorePatterns: ["[/\\\\]node_modules[/\\\\].+\\.(js|jsx|ts|tsx)$"],
	moduleNameMapper: {
		"^(\\.\\.?/.*)$": ["$1.ts", "$1"],
	},
	moduleFileExtensions: ["ts", "js", "json"],
};
