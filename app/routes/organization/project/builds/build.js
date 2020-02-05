import {action} from '@ember/object';
import {inject as service} from '@ember/service';
import Route from '@ember/routing/route';

export default class BuildRoute extends Route {
  @service
  reviews;

  @service
  commentThreads;

  model(params) {
    return this.store.findRecord('build', params.build_id, {reload: true});
  }

  @action
  async createReview(snapshots, eventData) {
    const build = this.modelFor('organization.project.builds.build');
    return this.reviews.createReview.perform({snapshots, build, eventData});
  }

  @action
  createCommentThread({snapshotId, commentBody, areChangesRequested, mentionedUsers}) {
    return this.commentThreads.createCommentThread.perform({
      snapshotId,
      commentBody,
      areChangesRequested,
      mentionedUsers,
    });
  }

  @action
  createComment({commentThread, commentBody, mentionedUsers}) {
    return this.commentThreads.createComment.perform({
      commentThread,
      commentBody,
      mentionedUsers,
    });
  }

  @action
  closeCommentThread({commentThread}) {
    return this.commentThreads.closeCommentThread.perform({commentThread});
  }
}
