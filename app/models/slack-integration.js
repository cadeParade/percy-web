import DS from 'ember-data';

export default DS.Model.extend({
  organization: DS.belongsTo('organization', {async: false}),
  slackIntegrationConfigs: DS.hasMany('slack-integration-configs', {async: false}),
  teamName: DS.attr(),
  channelName: DS.attr(),
  code: DS.attr(), // only used during create
  state: DS.attr(), // only used during create
});
