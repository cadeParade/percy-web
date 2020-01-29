import {computed} from '@ember/object';
import {and, bool, not} from '@ember/object/computed';
import Model, {attr, belongsTo, hasMany} from '@ember-data/model';

export default Model.extend({
  organization: belongsTo('organization', {async: false}),
  name: attr(),
  slug: attr(),
  fullSlug: attr(),
  defaultBaseBranch: attr(),
  isEnabled: attr('boolean'),
  isDisabled: not('isEnabled'),
  diffBase: attr(), // Either "automatic" or "manual".
  autoApproveBranchFilter: attr(),
  updatedAt: attr('date'),
  publiclyReadable: attr('boolean'),
  isDemo: attr('boolean'),

  // Repo will be set if this project is linked to a repository.
  repo: belongsTo('repo', {async: false}),
  isRepoConnected: bool('repo'),
  isGithubRepo: and('isRepoConnected', 'repo.isGithubRepo'),
  isGithubEnterpriseRepo: and('isRepoConnected', 'repo.isGithubEnterpriseRepo'),
  isGitlabRepo: and('isRepoConnected', 'repo.isGitlabRepo'),
  isGithubRepoFamily: and('isRepoConnected', 'repo.isGithubRepoFamily'),

  builds: hasMany('build', {async: true}),
  tokens: hasMany('token', {async: true}),
  webhookConfigs: hasMany('webhookConfig', {async: false}),

  projectBrowserTargets: hasMany('projectBrowserTargets', {async: false}),

  writeOnlyToken: computed('tokens', function() {
    return this.tokens.findBy('role', 'write_only');
  }),
});
