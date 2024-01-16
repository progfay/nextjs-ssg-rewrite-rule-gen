# `@progfay/nextjs-ssg-rewrite-rule-gen`

## Description

Next.js supports [Static Exports](https://nextjs.org/docs/pages/building-your-application/deploying/static-exports).

However, it's a lot of work to manage the routing for the generated file without Vercel.
[Dynamic Routes](https://nextjs.org/docs/pages/building-your-application/routing/dynamic-routes) feature makes routing more difficult.

This application automatically generates [nginx rewrite rules](https://www.nginx.com/blog/creating-nginx-rewrite-rules/) for generated files.

## Requirements

- [Next.js](https://github.com/vercel/next.js) ([Pages Router](https://nextjs.org/docs/pages) only)
- [nginx](https://github.com/nginx/nginx)

## Installation

```
npm install -D @progfay/nextjs-ssg-rewrite-rule-gen
```

## Configuration

> [!NOTE]
> This application is available with zero configuration.

You can run this application with config in following command: `nextjs-ssg-rewrite-rule-gen --config config.json`

```json
{
	"pagesDirPath": "apps/src/pages",
	"ignoreRoutes": ["/debug"],
  "nginxConfigs": [
    {
      "pattern": "^/credential$",
      "directives": ["add_header Cache-Control \"no-store\";"],
    }
  ],
	"basePath": "/app",
	"trailingSlash": true
}
```

Available configs:
- `pagesDirPath`: customize path for `pages` directory
- `ignoreRoutes`: exclude specific paths from outputs
- `nginxConfigs`: customize configuration inside of [nginx `location` directive](https://nginx.org/en/docs/http/ngx_http_core_module.html#location)
  - `pattern`: pattern string of [`RegExp`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/RegExp#pattern)
  - `directives`: additional nginx directives
- `basePath`: [next.config.js Options: basePath | Next.js](https://nextjs.org/docs/app/api-reference/next-config-js/basePath)
- `trailingSlash`: [next.config.js Options: trailingSlash | Next.js](https://nextjs.org/docs/app/api-reference/next-config-js/trailingSlash)

## How to work

`pages` directory:
```
pages
└── user
    ├── [id]
        └── index.js
    └── new
        └── index.js
```

↓

Generated files with Static Exports (`next build` and [`output: "export"`](https://nextjs.org/docs/pages/building-your-application/deploying/static-exports#configuration)):
```
out
└── user
    ├── [id].html
    └── new.html
```

↓

nginx rewrite rules (generated by `@progfay/nextjs-ssg-rewrite-rule-gen`):
```nginx
location ~ ^/user/new/?$ {
  rewrite ^/user/new/?$ /user/new.html break;
}

location ~ ^/user/[^/]+?/?$ {
  rewrite ^/user/[^/]+?/?$ /user/[id].html break;
}
```
