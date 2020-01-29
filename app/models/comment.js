import Model, {attr, belongsTo, hasMany} from '@ember-data/model';
import SaveManualMixin from 'percy-web/mixins/save-manual-mixin';

export default Model.extend(SaveManualMixin, {
  commentThread: belongsTo('comment-thread', {async: false}),
  author: belongsTo('user', {async: false}),
  body: attr('string'),
  createdAt: attr('date'),
  updatedAt: attr('date'),

  // Not actual fields - but needed for creating comment threads in the same request as comments.
  snapshotId: attr('string'),
  threadType: attr('string'),
  taggedUsers: hasMany('user'),
});
