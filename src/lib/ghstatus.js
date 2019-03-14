import Octokit from '@octokit/rest'

export const setGithubStatus = errWarnCount => {
  // silently skip unless building on Travis
  if (!process.env.TRAVIS_JOB_ID) {
    return
  }

  // skip if github auth token not available
  if (!process.env.GITHUB_TOKEN) {
    console.log("Environment variable GITHUB_TOKEN not set, skipping GitHub status.")
    return
  }

  console.log("Setting Github status for Travis build.");
  const octokit = new Octokit({
    auth: 'token ' + process.env.GITHUB_TOKEN
  });
  const repoSlug = process.env.TRAVIS_REPO_SLUG.split('/')
  const errors = errWarnCount.errorCount
  const warnings = errWarnCount.warningCount

  octokit.repos.createStatus({
    owner: repoSlug[0],
    repo: repoSlug[1],
    sha: process.env.TRAVIS_COMMIT,
    context: 'lint-diff',
    state: (errors > 0 ? 'failure' : 'success'),
    target_url: `https://travis-ci.com/${process.env.TRAVIS_REPO_SLUG}/jobs/${process.env.TRAVIS_JOB_ID}`,
    description: `errors: ${errors} warnings: ${warnings}`
  }).then(result => {
    if (result.meta.status === '201 Created') {
      console.log("GitHub status created.")
    } else {
      console.log(`Failed to create GitHub status with status ${result.meta.status}`)
    }
  })
}
