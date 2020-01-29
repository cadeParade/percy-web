import Model, {attr, belongsTo} from '@ember-data/model';

export default Model.extend({
  state: attr(),
  createdBy: belongsTo('user', {async: false}),
});
