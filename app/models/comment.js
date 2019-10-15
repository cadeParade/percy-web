import DS from 'ember-data';
import SaveManualMixin from 'percy-web/mixins/save-manual-mixin';

export default DS.Model.extend(SaveManualMixin, {
  commentThread: DS.belongsTo('comment-thread', {async: false}),
  author: DS.belongsTo('user', {async: false}),
  body: DS.attr('string'),
  createdAt: DS.attr('date'),
  updatedAt: DS.attr('date'),

  // Not actual fields - but needed for creating comment threads in the same request as comments.
  snapshotId: DS.attr('string'),
  threadType: DS.attr('string'),
  taggedUsers: DS.hasMany('user'),
});
