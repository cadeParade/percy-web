import Model, {attr, belongsTo, hasMany} from '@ember-data/model';

export const REVIEW_ACTIONS = {
  APPROVE: 'approve',
  REJECT: 'request_changes',
};

export default class Review extends Model {
  @belongsTo('build')
  build;

  @hasMany('snapshot')
  snapshots;

  @attr()
  action;
}
