import {computed} from '@ember/object';
import {not, bool, and} from '@ember/object/computed';
import Model, {attr, belongsTo, hasMany} from '@ember-data/model';

export default class Project extends Model {
  @belongsTo('organization', {async: false})
  organization;

  @attr()
  name;

  @attr()
  slug;

  @attr()
  fullSlug;

  @attr()
  defaultBaseBranch;

  @attr('boolean')
  isEnabled;

  @not('isEnabled')
  isDisabled;

  @attr()
  diffBase; // Either "automatic" or "manual".

  @attr()
  autoApproveBranchFilter;

  @attr('date')
  updatedAt;

  @attr('boolean')
  publiclyReadable;

  @attr('boolean')
  isDemo;

  // Repo will be set if this project is linked to a repository.
  @belongsTo('repo', {async: false})
  repo;

  @bool('repo')
  isRepoConnected;

  @and('isRepoConnected', 'repo.isGithubRepo')
  isGithubRepo;

  @and('isRepoConnected', 'repo.isGithubEnterpriseRepo')
  isGithubEnterpriseRepo;

  @and('isRepoConnected', 'repo.isGitlabRepo')
  isGitlabRepo;

  @and('isRepoConnected', 'repo.isGithubRepoFamily')
  isGithubRepoFamily;

  @hasMany('build', {async: true})
  builds;

  @hasMany('token', {async: true})
  tokens;

  @hasMany('webhookConfig', {async: false})
  webhookConfigs;

  @hasMany('projectBrowserTargets', {async: false})
  projectBrowserTargets;

  @computed('tokens')
  get writeOnlyToken() {
    return this.tokens.findBy('role', 'write_only');
  }
}
