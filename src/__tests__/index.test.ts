import path from "node:path";
import { describe, it } from "node:test";
import { generateNextjsSSGRewriteRule } from "../index.ts";

describe("generateNextjsSSGRewriteRule", () => {
	it("generate Next.js SSG rewrite rule", async ({ assert }) => {
		assert.equal(
			await generateNextjsSSGRewriteRule({
				pagesDirPath: path.resolve(import.meta.dirname, "pages"),
				ignoredRoutes: [],
				nginxConfigs: [],
				basePath: "",
				trailingSlash: true,
			}),
			`
location ~ ^/?$ {
  rewrite ^/?$ /index.html break;
}

location ~ ^/apples/[^/]+?/[^/]+?/ef/?$ {
  rewrite ^/apples/[^/]+?/[^/]+?/ef/?$ /apples/[ab]/[cd]/ef/index.html break;
}

location ~ ^/blog/abc/?$ {
  rewrite ^/blog/abc/?$ /blog/abc/index.html break;
}

location ~ ^/blog/abc/post/?$ {
  rewrite ^/blog/abc/post/?$ /blog/abc/post/index.html break;
}

location ~ ^/blog/abc/[^/]+?/?$ {
  rewrite ^/blog/abc/[^/]+?/?$ /blog/abc/[id]/index.html break;
}

location ~ ^/blog/[^/]+?/?$ {
  rewrite ^/blog/[^/]+?/?$ /blog/[id]/index.html break;
}

location ~ ^/blog/[^/]+?/comments/[^/]+?/?$ {
  rewrite ^/blog/[^/]+?/comments/[^/]+?/?$ /blog/[id]/comments/[cid]/index.html break;
}

location ~ ^/foo/[^/]+?/bar/baz/[^/]+?/?$ {
  rewrite ^/foo/[^/]+?/bar/baz/[^/]+?/?$ /foo/[d]/bar/baz/[f]/index.html break;
}

location ~ ^/p2/[^/]+?/?$ {
  rewrite ^/p2/[^/]+?/?$ /p2/[id]/index.html break;
}

location ~ ^/p2/[^/]+?/abc/?$ {
  rewrite ^/p2/[^/]+?/abc/?$ /p2/[id]/abc/index.html break;
}

location ~ ^/p3/[^/]+?/?$ {
  rewrite ^/p3/[^/]+?/?$ /p3/[id]/index.html break;
}

location ~ ^/p3/[^/]+?/abc/?$ {
  rewrite ^/p3/[^/]+?/abc/?$ /p3/[id]/abc/index.html break;
}

location ~ ^/posts/?$ {
  rewrite ^/posts/?$ /posts/index.html break;
}

location ~ ^/posts/[^/]+?/?$ {
  rewrite ^/posts/[^/]+?/?$ /posts/[id]/index.html break;
}

location ~ ^/[^/]+?/?$ {
  rewrite ^/[^/]+?/?$ /[root-slug]/index.html break;
}`.trim(),
		);
	});
});
