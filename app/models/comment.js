import classic from 'ember-classic-decorator';
import Model, {attr, belongsTo, hasMany} from '@ember-data/model';
import SaveManualMixin from 'percy-web/mixins/save-manual-mixin';

// Remove @classic when we can refactor away from mixins
@classic
export default class Comment extends Model.extend(SaveManualMixin) {
  @belongsTo('comment-thread', {async: false})
  commentThread;

  @belongsTo('user', {async: false})
  author;

  @attr('string')
  body;

  @attr('date')
  createdAt;

  @attr('date')
  updatedAt;

  // Not actual fields - but needed for creating comment threads in the same request as comments.
  @attr('string')
  snapshotId;

  @attr('string')
  threadType;

  @hasMany('user')
  taggedUsers;
}
