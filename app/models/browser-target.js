import Model, {attr, belongsTo} from '@ember-data/model';

export default class BrowserTarget extends Model {
  @belongsTo('browserFamily', {async: false, inverse: null})
  browserFamily;

  @attr()
  versionTarget;
}
