import {helper} from '@ember/component/helper';

export function repoLogo([repo]) {
  if (repo) {
    if (repo.get('isGithubRepoFamily')) {
      return 'github-icon';
    } else if (repo.get('isGitlabRepoFamily')) {
      return 'gitlab-icon';
    }
  }
}

export default helper(repoLogo);
