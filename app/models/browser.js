import Model, {attr, belongsTo} from '@ember-data/model';
import {alias} from '@ember/object/computed';

export default Model.extend({
  browserFamily: belongsTo('browserFamily', {async: false, inverse: null}),
  familyName: alias('browserFamily.name'),
  familySlug: alias('browserFamily.slug'),
  version: attr(),
});
