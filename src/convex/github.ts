import { action } from "./_generated/server";

export const getRepoInfo = action({
  args: {},
  handler: async () => {
    const { getRepoInfo } = await import("../lib/github");
    const owner = process.env.GITHUB_REPO_OWNER ?? "";
    const repo = process.env.GITHUB_REPO_NAME ?? "";
    if (!owner || !repo) return null;
    return getRepoInfo(owner, repo);
  },
});

export const getRecentCommits = action({
  args: {},
  handler: async () => {
    const { getRecentCommits } = await import("../lib/github");
    const owner = process.env.GITHUB_REPO_OWNER ?? "";
    const repo = process.env.GITHUB_REPO_NAME ?? "";
    if (!owner || !repo) return [];
    return getRecentCommits(owner, repo, 5);
  },
});

export const getRepoIssues = action({
  args: {},
  handler: async () => {
    const { getRepoIssues } = await import("../lib/github");
    const owner = process.env.GITHUB_REPO_OWNER ?? "";
    const repo = process.env.GITHUB_REPO_NAME ?? "";
    if (!owner || !repo) return [];
    return getRepoIssues(owner, repo, 10);
  },
});
