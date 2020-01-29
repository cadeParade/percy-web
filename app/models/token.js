import Model, {attr, belongsTo} from '@ember-data/model';

export default Model.extend({
  token: attr(),
  role: attr(),

  project: belongsTo('project', {inverse: 'tokens'}),
});
