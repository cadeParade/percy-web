import Model, {attr, belongsTo} from '@ember-data/model';
import {computed} from '@ember/object';
import {not} from '@ember/object/computed';

export default Model.extend({
  webhookConfig: belongsTo('webhook-config'),
  event: attr(),
  url: attr(),
  requestHeaders: attr(),
  requestPayload: attr('string'),
  responseHeaders: attr(),
  responsePayload: attr(),
  responseStatus: attr('number'),
  responseTimeMs: attr('number'),
  failureReason: attr(),
  createdAt: attr('date'),

  isSuccess: not('isFailure'),

  isFailure: computed('failureReason', 'responseStatus', function() {
    const status = this.responseStatus;

    return this.failureReason || !(status >= 200 && status < 300);
  }),
});
