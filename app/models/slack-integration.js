import Model, {attr, belongsTo, hasMany} from '@ember-data/model';

export default Model.extend({
  organization: belongsTo('organization', {async: false}),
  slackIntegrationConfigs: hasMany('slack-integration-config', {async: false}),
  teamName: attr(),
  channelName: attr(),
  code: attr(), // only used during create
  state: attr(), // only used during create
});
