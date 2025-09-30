"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = void 0;
const core_1 = require("@actions/core");
const github_1 = require("@actions/github");
const util_1 = require("./util");
const token = core_1.getInput("token") || process.env.GH_PAT || process.env.GITHUB_TOKEN;
const run = async () => {
    if (!token)
        throw new Error("GitHub token not found");
    const octokit = github_1.getOctokit(token);
    /**
     * This action will only work on `pull_request` events
     */
    if (!github_1.context.payload.pull_request)
        return console.log("No pull request found");
    const owner = github_1.context.repo.owner;
    const repo = github_1.context.repo.repo;
    const branch = github_1.context.ref.replace('refs/heads/', '');
    const { data: pulls } = await octokit.rest.pulls.list({
        owner,
        repo,
        head: `${owner}:${branch}`,
        state: 'open'
    });
    if (pulls.length > 0) {
        return console.log(`There are ${pulls.length} open PRs for branch ${branch}`);
    }
    const pullRequest = github_1.context.payload
        .pull_request;
    const branchName = pullRequest.head.ref;
    console.log("Branches to delete are", core_1.getInput("branches"));
    console.log("This branch is", branchName);
    const should = util_1.shouldMerge(branchName, core_1.getInput("branches"));
    const pullRequestInfo = await octokit.pulls.get({
        owner: github_1.context.repo.owner,
        repo: github_1.context.repo.repo,
        pull_number: pullRequest.number,
    });
    console.log("Should we delete this branch?", should);
    console.log("Is this PR merged?", pullRequestInfo.data.merged);
    /**
     * Pull request has been merged
     */
    if (pullRequestInfo.data.merged && should) {
        console.log("Proceeding to delete branch");
        try {
            await octokit.git.deleteRef({
                owner: github_1.context.repo.owner,
                repo: github_1.context.repo.repo,
                ref: `heads/${branchName}`,
            });
            console.log("Deleted branch");
        }
        catch (error) {
            console.log("Got an error in deleting", error);
        }
    }
    else {
        console.log("Not deleting this branch");
    }
};
exports.run = run;
exports.run()
    .then(() => { })
    .catch((error) => {
    console.error("ERROR", error);
    core_1.setFailed(error.message);
});
//# sourceMappingURL=index.js.map