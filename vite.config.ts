import { defineConfig } from "vite-plus";

export default defineConfig({
  staged: {
    "*": "vp check --fix",
  },
  fmt: {},
  lint: {
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    rules: { "vite-plus/prefer-vite-plus-imports": "error" },
    options: { typeAware: true, typeCheck: true },
    // fixture files for tests; intentionally empty page files, not real source
    ignorePatterns: ["src/__tests__/pages/**"],
  },
  pack: {
    entry: ["src/index.ts"],
    format: ["esm"],
    minify: true,
  },
  test: {
    include: ["src/**/*.test.ts"],
  },
});
