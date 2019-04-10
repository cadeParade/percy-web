import DS from 'ember-data';

export const ALL_PROJECTS_ID = 'allProjects';
export const ALL_PROJECTS_LABEL = 'All projects';

export default DS.Model.extend({
  slackIntegration: DS.belongsTo('slack-integration', {async: false}),
  projectId: DS.attr(),
  notificationTypes: DS.attr(),
});
