import DS from 'ember-data';

export default DS.Model.extend({
  token: DS.attr(),
  role: DS.attr(),

  project: DS.belongsTo('project', {inverse: 'tokens'}),
});
