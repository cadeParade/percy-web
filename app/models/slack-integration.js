import Model, {attr, belongsTo, hasMany} from '@ember-data/model';

export default class SlackIntegration extends Model {
  @belongsTo('organization', {async: false})
  organization;

  @hasMany('slack-integration-config', {async: false})
  slackIntegrationConfigs;

  @attr()
  teamName;

  @attr()
  channelName;

  @attr()
  code; // only used during create

  @attr()
  state; // only used during create
}
