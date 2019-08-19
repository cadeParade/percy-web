import DS from 'ember-data';

export const REVIEW_ACTIONS = {
  APPROVE: 'approve',
  REJECT: 'request_changes',
};

export default DS.Model.extend({
  build: DS.belongsTo('build'),
  snapshots: DS.hasMany('snapshot'),
  action: DS.attr(),
});
