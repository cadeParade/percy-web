import Model, {attr, belongsTo, hasMany} from '@ember-data/model';
import {and, empty, equal, notEmpty} from '@ember/object/computed';
import LoadableModel from 'ember-data-storefront/mixins/loadable-model';

export const REVIEW_COMMENT_TYPE = 'request_changes';
export const NOTE_COMMENT_TYPE = 'note';

export default Model.extend(LoadableModel, {
  snapshot: belongsTo('snapshot', {async: false}),
  comments: hasMany('comment', {async: false}),
  type: attr('string'),
  closedAt: attr('date'),
  closedBy: belongsTo('user', {async: false}),
  createdAt: attr('date'),
  updatedAt: attr('date'),
  originatingBuildNumber: attr(),
  originatingSnapshotId: attr(),

  isReview: equal('type', REVIEW_COMMENT_TYPE),
  isNote: equal('type', NOTE_COMMENT_TYPE),

  isOpen: empty('closedAt'),
  isClosed: notEmpty('closedAt'),

  isResolvable: and('isReview', 'isOpen'),
  isArchivable: and('isNote', 'isOpen'),

  isResolved: and('isReview', 'isClosed'),
  isArchived: and('isNote', 'isClosed'),
});
