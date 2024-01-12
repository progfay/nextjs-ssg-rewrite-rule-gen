import { type Route, sortRoutesByRoutingPriorityOrder } from "./nextjs";

describe(sortRoutesByRoutingPriorityOrder, () => {
	it.each([
		[
			["/menu", "/me"],
			["/me", "/menu"],
		],
		[
			["/user/[id]", "/user/new"],
			["/user/new", "/user/[id]"],
		],
		[
			["/course/[subjectCode]/credit", "/course/subject/[subjectCode]"],
			["/course/subject/[subjectCode]", "/course/[subjectCode]/credit"],
		],
	])("sortRoutesByRoutingPriorityOrder(%j) -> %j", (input, expected) => {
		expect(sortRoutesByRoutingPriorityOrder(input as Route[])).toEqual(
			expected,
		);
	});

	// ref. https://github.com/vercel/next.js/blob/127c5bbf80d44e256533db028d7a595a1c3defe0/test/unit/page-route-sorter.test.ts#L19-L67
	it("lead same results in Next.js test case", () => {
		expect(
			sortRoutesByRoutingPriorityOrder([
				"/posts",
				"/[root-slug]",
				"/",
				"/posts/[id]",
				"/blog/[id]/comments/[cid]",
				"/blog/abc/[id]",
				// '/[...rest]', // not supported
				"/blog/abc/post",
				"/blog/abc",
				// '/p1/[[...incl]]', // not supported
				// '/p/[...rest]', // not supported
				// '/p2/[...rest]', // not supported
				"/p2/[id]",
				"/p2/[id]/abc",
				// '/p3/[[...rest]]', // not supported
				"/p3/[id]",
				"/p3/[id]/abc",
				"/blog/[id]",
				"/foo/[d]/bar/baz/[f]",
				"/apples/[ab]/[cd]/ef",
			] as Route[]),
		).toEqual([
			"/",
			"/apples/[ab]/[cd]/ef",
			"/blog/abc",
			"/blog/abc/post",
			"/blog/abc/[id]",
			"/blog/[id]",
			"/blog/[id]/comments/[cid]",
			"/foo/[d]/bar/baz/[f]",
			// '/p/[...rest]', // not supported
			// '/p1/[[...incl]]', // not supported
			"/p2/[id]",
			"/p2/[id]/abc",
			// '/p2/[...rest]', // not supported
			"/p3/[id]",
			"/p3/[id]/abc",
			// '/p3/[[...rest]]', // not supported
			"/posts",
			"/posts/[id]",
			"/[root-slug]",
			// '/[...rest]', // not supported
		]);
	});
});
