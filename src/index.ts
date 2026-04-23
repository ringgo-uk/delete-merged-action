import { getInput, setFailed } from "@actions/core";
import { context, getOctokit } from "@actions/github";
import type { PullRequestEvent } from "@octokit/webhooks-types";
import { shouldDelete } from "./util";

const token =
  getInput("token") || process.env.GH_PAT || process.env.GITHUB_TOKEN;

export const run = async () => {
  if (!token) throw new Error("GitHub token not found");
  const octokit = getOctokit(token);
  const api = ((octokit as any).rest ?? octokit) as any;

  /**
   * This action will only work on `pull_request` events
   */
  const pullRequest = context.payload.pull_request as
    | PullRequestEvent["pull_request"]
    | undefined;

  if (!pullRequest) return console.log("No pull request found");

  const owner = context.repo.owner;
  const repo = context.repo.repo;
  const branchName = pullRequest.head.ref;

  const { data: pullsForHead } = await api.pulls.list({
    owner,
    repo,
    head: `${owner}:${branchName}`,
    state: "open",
  });

  if (pullsForHead.length > 0) {
    return console.log(
      `There are ${pullsForHead.length} open PR(s) for head branch ${branchName}`
    );
  }

  console.log("Branches to delete are", getInput("branches"));
  console.log("This branch is", branchName);
  const should = shouldDelete(branchName, getInput("branches"));

  const pullRequestInfo = await api.pulls.get({
    owner: context.repo.owner,
    repo: context.repo.repo,
    pull_number: pullRequest.number,
  });
  console.log("Should we delete this branch?", should);
  console.log("Is this PR merged?", pullRequestInfo.data.merged);

  /**
   * Pull request has been merged
   */
  if (pullRequestInfo.data.merged && should) {
    const retargetBase = (getInput("retarget_base") || "").trim();
    
    if (retargetBase) {
      console.log(
        `Retargeting any open PRs with base ${branchName} to ${retargetBase}`
      );

      const { data: pullsForBase } = await api.pulls.list({
        owner,
        repo,
        base: branchName,
        state: "open",
      });

      for (const pr of pullsForBase) {
        try {
          await api.pulls.update({
            owner,
            repo,
            pull_number: pr.number,
            base: retargetBase,
          });
          console.log(
            `Retargeted PR #${pr.number} from base ${branchName} to ${retargetBase}`
          );
        } catch (error) {
          console.log(`Failed to retarget PR #${pr.number}`, error);
        }
      }

      const { data: remainingPullsForBase } = await api.pulls.list({
        owner,
        repo,
        base: branchName,
        state: "open",
      });

      if (remainingPullsForBase.length > 0) {
        return console.log(
          `Not deleting because branch ${branchName} is still the base of ${remainingPullsForBase.length} open PR(s)`
        );
      }
    }

    console.log("Proceeding to delete branch");
    try {
      await api.git.deleteRef({
        owner: context.repo.owner,
        repo: context.repo.repo,
        ref: `heads/${branchName}`,
      });
      console.log("Deleted branch");
    } catch (error) {
      console.log("Got an error in deleting", error);
    }
  } else {
    console.log("Not deleting this branch");
  }
};

run()
  .then(() => { })
  .catch((error) => {
    console.error("ERROR", error);
    setFailed(error.message);
  });
