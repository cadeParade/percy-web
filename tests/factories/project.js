import FactoryGuy from 'ember-data-factory-guy';
import faker from 'faker';

FactoryGuy.define('project', {
  default: {
    name: () => faker.commerce.productName(),
    publiclyReadable: false,
    isEnabled: true,
  },
  traits: {
    withRepo: {repo: FactoryGuy.belongsTo('repo')},
    withGithubRepo: {repo: FactoryGuy.belongsTo('repo', 'github')},
    withGitlabRepo: {repo: FactoryGuy.belongsTo('repo', 'gitlab')},
    withGithubEnterpriseRepo: {repo: FactoryGuy.belongsTo('repo', 'githubEnterprise')},
    public: {publiclyReadable: true},
  },
});
