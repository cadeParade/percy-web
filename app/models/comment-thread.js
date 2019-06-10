import DS from 'ember-data';
import {and, empty, equal, notEmpty} from '@ember/object/computed';

export const REVIEW_COMMENT_TYPE = 'request_changes';
export const NOTE_COMMENT_TYPE = 'note';

export default DS.Model.extend({
  snapshot: DS.belongsTo('snapshot', {async: false}),
  comments: DS.hasMany('comment', {async: false}),
  type: DS.attr('string'),
  closedAt: DS.attr('date'),
  closedBy: DS.belongsTo('user', {async: false}),
  createdAt: DS.attr('date'),
  updatedAt: DS.attr('date'),

  isReview: equal('type', REVIEW_COMMENT_TYPE),
  isNote: equal('type', NOTE_COMMENT_TYPE),

  isOpen: empty('closedAt'),
  isClosed: notEmpty('closedAt'),

  isResolvable: and('isReview', 'isOpen'),
  isArchivable: and('isNote', 'isOpen'),

  isResolved: and('isReview', 'isClosed'),
  isArchived: and('isNote', 'isClosed'),
});