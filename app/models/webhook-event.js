import {computed} from '@ember/object';
import {not} from '@ember/object/computed';
import Model, {attr, belongsTo} from '@ember-data/model';

export default class WebhookEvent extends Model {
  @belongsTo('webhook-config')
  webhookConfig;

  @attr()
  event;

  @attr()
  url;

  @attr()
  requestHeaders;

  @attr('string')
  requestPayload;

  @attr()
  responseHeaders;

  @attr()
  responsePayload;

  @attr('number')
  responseStatus;

  @attr('number')
  responseTimeMs;

  @attr()
  failureReason;

  @attr('date')
  createdAt;

  @not('isFailure')
  isSuccess;

  @computed('failureReason', 'responseStatus')
  get isFailure() {
    const status = this.responseStatus;

    return this.failureReason || !(status >= 200 && status < 300);
  }
}
