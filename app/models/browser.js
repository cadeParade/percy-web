import {alias} from '@ember/object/computed';
import Model, {attr, belongsTo} from '@ember-data/model';

export default class Browser extends Model {
  @belongsTo('browserFamily', {async: false, inverse: null})
  browserFamily;

  @alias('browserFamily.name')
  familyName;

  @alias('browserFamily.slug')
  familySlug;

  @attr()
  version;
}
