import {helper} from '@ember/component/helper';

export function repoLogo([repo]) {
  if (repo) {
    if (repo.get('isGithubRepoFamily')) {
      return 'github-icon';
    } else if (repo.get('isGitlabRepoFamily')) {
      return 'gitlab-icon';
    } else if (repo.get('isBitbucketCloudRepo')) {
      return 'bitbucket-icon';
    }
  }
}

export default helper(repoLogo);
