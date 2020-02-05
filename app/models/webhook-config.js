import Model, {attr, belongsTo, hasMany} from '@ember-data/model';
import utils from 'percy-web/lib/utils';

export default class WebhookConfig extends Model {
  @belongsTo('project')
  project;

  @hasMany('webhook-event')
  webhookEvents;

  @attr()
  url;

  @attr()
  description;

  @attr()
  status;

  @attr({
    defaultValue() {
      return ['ping'];
    },
  })
  subscribedEvents;

  @attr('boolean', {defaultValue: true})
  deliveryEnabled;

  @attr('boolean', {defaultValue: true})
  sslVerificationEnabled;

  @attr({
    defaultValue() {
      return utils.generateRandomToken();
    },
  })
  authToken;
}
