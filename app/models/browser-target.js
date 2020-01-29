import Model, {attr, belongsTo} from '@ember-data/model';

export default Model.extend({
  browserFamily: belongsTo('browserFamily', {async: false, inverse: null}),
  versionTarget: attr(),
});
