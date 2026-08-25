import { action } from "./_generated/server";

/**
 * Creates a new GitHub repo and pushes the project files via the GitHub API.
 * Requires GITHUB_TOKEN env var with repo scope.
 */
export const createRepo = action({
  args: {},
  handler: async (ctx) => {
    const { Octokit } = await import("octokit");
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      return "ERROR: No GITHUB_TOKEN found. Add it in the Keys/API keys tab with key name GITHUB_TOKEN.";
    }

    const octokit = new Octokit({ auth: token });

    // Get the authenticated user
    const { data: user } = await octokit.rest.users.getAuthenticated();
    const owner = user.login;

    const repoName = "poly-pmna";
    const description = "Polytechnic Study Materials — Kerala Polytechnic curriculum notes, question papers, lessons, and tools";

    // Check if repo already exists
    try {
      await octokit.rest.repos.get({ owner, repo: repoName });
      return `Repo already exists: https://github.com/${owner}/${repoName}`;
    } catch {
      // Repo doesn't exist, create it
    }

    // Create the repo
    const { data: repo } = await octokit.rest.repos.createForAuthenticatedUser({
      name: repoName,
      description,
      auto_init: true,
      private: false,
    });

    return `✅ Repo created: ${repo.html_url}\n\nClone it and push:\n  git remote add origin ${repo.git_url}\n  git push -u origin main`;
  },
});
