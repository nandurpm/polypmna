import { Octokit } from "octokit";

const token = process.env.GITHUB_TOKEN;

export const octokit = token ? new Octokit({ auth: token }) : null;

export async function getRepoInfo(owner: string, repo: string) {
  if (!octokit) return null;
  try {
    const { data } = await octokit.rest.repos.get({ owner, repo });
    return {
      name: data.name,
      description: data.description,
      stargazersCount: data.stargazers_count,
      forksCount: data.forks_count,
      language: data.language,
      updatedAt: data.updated_at,
      htmlUrl: data.html_url,
    };
  } catch {
    return null;
  }
}

export async function getRecentCommits(
  owner: string,
  repo: string,
  limit = 5,
) {
  if (!octokit) return [];
  try {
    const { data } = await octokit.rest.repos.listCommits({
      owner,
      repo,
      per_page: limit,
    });
    return data.map((c) => ({
      sha: c.sha.slice(0, 7),
      message: c.commit.message.split("\n")[0],
      author: c.commit.author?.name ?? "Unknown",
      date: c.commit.author?.date ?? "",
      url: c.html_url,
    }));
  } catch {
    return [];
  }
}

export async function getRepoIssues(
  owner: string,
  repo: string,
  limit = 10,
) {
  if (!octokit) return [];
  try {
    const { data } = await octokit.rest.issues.listForRepo({
      owner,
      repo,
      state: "open",
      per_page: limit,
    });
    return data.map((i) => ({
      number: i.number,
      title: i.title,
      labels: i.labels.map((l) => (typeof l === "string" ? l : l.name ?? "")),
      createdAt: i.created_at,
      url: i.html_url,
    }));
  } catch {
    return [];
  }
}
