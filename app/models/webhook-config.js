import Model, {attr, belongsTo, hasMany} from '@ember-data/model';
import utils from 'percy-web/lib/utils';

export default Model.extend({
  project: belongsTo('project'),
  webhookEvents: hasMany('webhook-event'),
  url: attr(),
  description: attr(),
  status: attr(),
  subscribedEvents: attr({
    defaultValue() {
      return ['ping'];
    },
  }),
  deliveryEnabled: attr('boolean', {defaultValue: true}),
  sslVerificationEnabled: attr('boolean', {defaultValue: true}),
  authToken: attr({
    defaultValue() {
      return utils.generateRandomToken();
    },
  }),
});
