import Model, {attr, belongsTo, hasMany} from '@ember-data/model';

export const REVIEW_ACTIONS = {
  APPROVE: 'approve',
  REJECT: 'request_changes',
};

export default Model.extend({
  build: belongsTo('build'),
  snapshots: hasMany('snapshot'),
  action: attr(),
});
