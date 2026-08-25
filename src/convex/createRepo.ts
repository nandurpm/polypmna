import { action } from "./_generated/server";

/**
 * Creates a new GitHub repo and pushes project files via the GitHub API.
 * Requires GITHUB_TOKEN_NEW env var with repo scope.
 */
export const createRepo = action({
  args: {},
  handler: async (ctx) => {
    const { Octokit } = await import("octokit");
    const token = process.env.GITHUB_TOKEN_NEW;
    if (!token) {
      return "ERROR: No GITHUB_TOKEN_NEW found. Add it in the Keys/API keys tab.";
    }

    const octokit = new Octokit({ auth: token });

    // Get the authenticated user
    const { data: user } = await octokit.rest.users.getAuthenticated();
    const owner = user.login;

    const repoName = "poly-pmna";
    const description =
      "Polytechnic Study Materials — Kerala SITTTR curriculum notes, question papers, lessons, and study tools";

    // Check if repo already exists
    try {
      const { data: existingRepo } = await octokit.rest.repos.get({
        owner,
        repo: repoName,
      });
      return `Repo already exists: ${existingRepo.html_url}\n\nYou can push new code with:\n  git remote add origin ${existingRepo.clone_url}\n  git push -u origin main --force`;
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

    return [
      `✅ Repo created: ${repo.html_url}`,
      ``,
      `To push your code:`,
      `1. Download your project files from Freebuff`,
      `2. In the project folder, run:`,
      `   git init`,
      `   git remote add origin ${repo.clone_url}`,
      `   git add .`,
      `   git commit -m "Initial commit"`,
      `   git push -u origin main --force`,
    ].join("\n");
  },
});
