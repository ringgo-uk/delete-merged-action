"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = void 0;
const core_1 = require("@actions/core");
const github_1 = require("@actions/github");
const util_1 = require("./util");
const token = (0, core_1.getInput)("token") || process.env.GH_PAT || process.env.GITHUB_TOKEN;
const run = async () => {
    if (!token)
        throw new Error("GitHub token not found");
    const octokit = (0, github_1.getOctokit)(token);
    /**
     * This action will only work on `pull_request` events
     */
    const pullRequest = github_1.context.payload
        .pull_request;
    if (!pullRequest)
        return console.log("No pull request found");
    const owner = github_1.context.repo.owner;
    const repo = github_1.context.repo.repo;
    const branchName = pullRequest.head.ref;
    const { data: pullsForHead } = await octokit.rest.pulls.list({
        owner,
        repo,
        head: `${owner}:${branchName}`,
        state: "open",
    });
    if (pullsForHead.length > 0) {
        return console.log(`There are ${pullsForHead.length} open PR(s) for head branch ${branchName}`);
    }
    console.log("Branches to delete are", (0, core_1.getInput)("branches"));
    console.log("This branch is", branchName);
    const should = (0, util_1.shouldMerge)(branchName, (0, core_1.getInput)("branches"));
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
        const retargetBase = ((0, core_1.getInput)("retarget_base") || "").trim();
        if (retargetBase) {
            console.log(`Retargeting any open PRs with base ${branchName} to ${retargetBase}`);
            const { data: pullsForBase } = await octokit.rest.pulls.list({
                owner,
                repo,
                base: branchName,
                state: "open",
            });
            for (const pr of pullsForBase) {
                try {
                    await octokit.rest.pulls.update({
                        owner,
                        repo,
                        pull_number: pr.number,
                        base: retargetBase,
                    });
                    console.log(`Retargeted PR #${pr.number} from base ${branchName} to ${retargetBase}`);
                }
                catch (error) {
                    console.log(`Failed to retarget PR #${pr.number}`, error);
                }
            }
            const { data: remainingPullsForBase } = await octokit.rest.pulls.list({
                owner,
                repo,
                base: branchName,
                state: "open",
            });
            if (remainingPullsForBase.length > 0) {
                return console.log(`Not deleting because branch ${branchName} is still the base of ${remainingPullsForBase.length} open PR(s)`);
            }
        }
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
(0, exports.run)()
    .then(() => { })
    .catch((error) => {
    console.error("ERROR", error);
    (0, core_1.setFailed)(error.message);
});
//# sourceMappingURL=index.js.map