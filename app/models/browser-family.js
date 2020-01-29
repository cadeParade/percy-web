import Model, {attr, hasMany} from '@ember-data/model';

export default Model.extend({
  browsers: hasMany('browser', {async: false}),
  name: attr(),
  slug: attr(),
});
