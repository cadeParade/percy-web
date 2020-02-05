import classic from 'ember-classic-decorator';
import {notEmpty, equal, empty, and} from '@ember/object/computed';
import Model, {attr, belongsTo, hasMany} from '@ember-data/model';
import LoadableModel from 'ember-data-storefront/mixins/loadable-model';

export const REVIEW_COMMENT_TYPE = 'request_changes';
export const NOTE_COMMENT_TYPE = 'note';

// Remove @classic when we can refactor away from mixins
@classic
export default class CommentThread extends Model.extend(LoadableModel) {
  @belongsTo('snapshot', {async: false})
  snapshot;

  @hasMany('comment', {async: false})
  comments;

  @attr('string')
  type;

  @attr('date')
  closedAt;

  @belongsTo('user', {async: false})
  closedBy;

  @attr('date')
  createdAt;

  @attr('date')
  updatedAt;

  @attr()
  originatingBuildNumber;

  @attr()
  originatingSnapshotId;

  @equal('type', REVIEW_COMMENT_TYPE)
  isReview;

  @equal('type', NOTE_COMMENT_TYPE)
  isNote;

  @empty('closedAt')
  isOpen;

  @notEmpty('closedAt')
  isClosed;

  @and('isReview', 'isOpen')
  isResolvable;

  @and('isNote', 'isOpen')
  isArchivable;

  @and('isReview', 'isClosed')
  isResolved;

  @and('isNote', 'isClosed')
  isArchived;
}
