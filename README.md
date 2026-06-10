# GSoC-Spy

A tool for tracking pull request activity and identifying active contributors across GitHub repositories — built for GSoC participants trying to figure out which orgs are actually mergeable before they invest weeks in a proposal.

[Live: gsoc-spy.vercel.app](https://gsoc-spy.vercel.app/) · ⭐ 82+

## The problem it solves

GSoC applicants face a guessing game every year: which organizations are worth applying to? A "popular org" with hundreds of applicants and slow PR review cycles is often a worse bet than a smaller org with active maintainers. The information exists on GitHub but it's tedious to extract — you'd have to manually scan PR histories across dozens of repos to find the signal.

GSoC-Spy aggregates that signal automatically. Point it at any repo, get back contributor rankings, PR velocity, maintainer activity, and merge rates filtered by time period. The tool grew organically to 82+ stars because it solves a real problem that recurs annually for ~30,000 GSoC applicants.

## Engineering decisions worth talking about

### Caching strategy

The GitHub API rate-limits unauthenticated requests to 60/hour and authenticated requests to 5,000/hour. For a tool that analyzes hundreds of PRs across multiple repos, a naive implementation would burn through the rate limit in seconds.

The caching layer has three tiers:

- **Maintainer-status cache** (1-hour TTL) — checking whether a contributor is a maintainer requires a separate permissions API call. Caching this aggressively was the highest-leverage win because maintainer status rarely changes within a session.
- **General data cache** (5-minute TTL) — PRs, contributor stats, repo metadata. Short TTL because users often refresh to see new activity.
- **In-flight request deduplication** — if the UI triggers the same API call twice (which happens during fast filter changes), the second call attaches to the first promise instead of firing a duplicate request.

Net effect: ~80% reduction in API calls under normal usage. Some users with high-traffic patterns reported never hitting rate limits even without a PAT.

### Pagination handling

GitHub's PR endpoints return 100 results per page. Active repos like Django or Wagtail have thousands of PRs. Loading all of them is expensive; loading none of them is useless. The compromise: paginate up to 5 pages (500 PRs) by default, surface a clear "showing 500 of N" indicator, and let users with PATs unlock deeper pagination.

The choice of 500 wasn't arbitrary — it covers ~80% of GSoC orgs' annual PR volume while keeping initial load under 3 seconds.

### Maintainer detection

Distinguishing maintainers from regular contributors matters because their activity signals are different (a maintainer merging 5 PRs/week is healthy; a contributor doing the same is unusual). I check the `permission` field on the repo collaborators endpoint and classify anyone with `push` or `admin` access as a maintainer. This is more reliable than role-based heuristics (which break on personal repos) or commit-count heuristics (which break on long-tenured contributors who've stopped contributing).

### Why client-side only

The whole app runs in the browser — no backend, no database, no auth system. PATs are stored in localStorage and never leave the user's machine. This was a deliberate choice:

- Keeps deployment costs at zero (Vercel free tier)
- Avoids storing other people's GitHub tokens (a real security risk if the backend were compromised)
- Makes the tool trustworthy enough that users actually paste their tokens in

Tradeoff: no shared state across devices, no team features, no historical data beyond what's currently cached. For the tool's actual use case (one-off PR analysis during GSoC application season) these aren't real costs.

## Stack

- React + TypeScript + Vite
- Tailwind for styling
- Octokit for GitHub API integration
- date-fns for the time-range filtering
- Custom caching and deduplication layer (no external library — small enough to write directly)

## Running locally

```bash
git clone https://github.com/JigyasuRajput/gsoc-spy.git
cd gsoc-spy
npm install
npm run dev
```

Add a GitHub PAT in the UI for higher rate limits. The app works without one but you'll hit the 60/hour ceiling quickly on active repos.

## What I'd build differently

If I rewrote this today, I'd:

- Move the maintainer-status cache to a shared backend so multiple users benefit from one API call instead of each browser making its own
- Add a server-side rate-limit budget across all users (cleaner than the current per-user rate limiting)
- Persist contributor analysis to a Postgres so you could track velocity changes over multiple GSoC cycles, not just point-in-time snapshots

These are real limitations of the current architecture, not aspirations. The client-only design was right for v1; it's the wrong design for v2.

## Contributing

Good-first-issues are tagged in the [Issues tab](https://github.com/JigyasuRajput/gsoc-spy/issues). The caching layer and the GitHub API integration are the most interesting parts to contribute to.

## Contact

- GitHub: [JigyasuRajput](https://github.com/JigyasuRajput)
- LinkedIn: [jigyasu-rajput](https://www.linkedin.com/in/jigyasu-rajput/)
- Email: jigyasu2021@gmail.com
