import Service, {inject as service} from '@ember/service';
import {SNAPSHOT_REJECTED_STATE, SNAPSHOT_REVIEW_STATE_REASONS} from 'percy-web/models/snapshot';
import {task} from 'ember-concurrency';
import {REVIEW_COMMENT_TYPE, NOTE_COMMENT_TYPE} from 'percy-web/models/comment-thread';

export default class CommentThreadsService extends Service {
  @service
  store;

  getCommentsForBuild(buildId) {
    return this.store.loadRecords('commentThread', {
      filter: {
        build: buildId,
      },
      include: 'comments,comments.author',
    });
  }

  getCommentsForSnapshotIds(snapshotIds, build) {
    const numSnapshots = snapshotIds.length;
    // If we request too many snapshot ids, the API responds with 400 request too long
    if (numSnapshots === 0 || numSnapshots > 30) {
      return this.getCommentsForBuild(build.get('id'));
    }

    return this.store.loadRecords('commentThread', {
      filter: {
        build: build.get('id'),
        snapshot_ids: snapshotIds.join(','),
      },
      include: 'comments,comments.author',
    });
  }

  @task(function* ({commentThread, commentBody, mentionedUsers}) {
    const newComment = this.store.createRecord('comment', {
      commentThread: commentThread,
      body: commentBody,
      taggedUsers: mentionedUsers,
    });
    return yield newComment.save().catch(() => {
      newComment.rollbackAttributes();
    });
  })
  createComment;

  @task(function* ({snapshotId, commentBody, areChangesRequested, mentionedUsers}) {
    const snapshot = this.store.peekRecord('snapshot', snapshotId);
    const newComment = this.store.createRecord('comment', {
      snapshotId,
      body: commentBody,
      threadType: areChangesRequested ? REVIEW_COMMENT_TYPE : NOTE_COMMENT_TYPE,
      taggedUsers: mentionedUsers,
    });

    if (areChangesRequested) {
      snapshot.set('reviewState', SNAPSHOT_REJECTED_STATE);
      snapshot.set('reviewStateReason', SNAPSHOT_REVIEW_STATE_REASONS.USER_REJECTED);
    }

    return yield newComment
      .save()
      .then(() => {
        snapshot.reload();
      })
      .catch(() => {
        newComment.rollbackAttributes();
        snapshot.rollbackAttributes();
      });
  })
  createCommentThread;

  @task(function* ({commentThread}) {
    commentThread.set('closedAt', new Date());
    return yield commentThread.save().catch(() => {
      commentThread.rollbackAttributes();
    });
  })
  closeCommentThread;
}
