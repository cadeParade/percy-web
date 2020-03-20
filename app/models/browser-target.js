import {and} from '@ember/object/computed';
import Model, {attr, belongsTo} from '@ember-data/model';

export default class BrowserTarget extends Model {
  @belongsTo('browserFamily', {async: false, inverse: null})
  browserFamily;

  @attr()
  versionTarget;

  @attr()
  deprecationPeriodStart;

  @attr()
  deprecationPeriodEnd;

  @and('deprecationPeriodStart', 'deprecationPeriodEnd')
  isDeprecated;
}
