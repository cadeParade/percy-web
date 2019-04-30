import FactoryGuy from 'ember-data-factory-guy';

FactoryGuy.define('slack-integration-config', {
  default: {
    slackIntegration: FactoryGuy.belongsTo('slack-integration'),
    projectId: () => {},
    notificationTypes: () => ['finished_auto_approved_branch'],
  },
});
