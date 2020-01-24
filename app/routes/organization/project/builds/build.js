import Route from '@ember/routing/route';
import {inject as service} from '@ember/service';

export default Route.extend({
  reviews: service(),
  commentThreads: service(),

  model(params) {
    return this.store.findRecord('build', params.build_id, {reload: true});
  },

  actions: {
    async createReview(snapshots, eventData) {
      const build = this.modelFor('organization.project.builds.build');
      return this.reviews.createReview.perform({snapshots, build, eventData});
    },

    createCommentThread({snapshotId, commentBody, areChangesRequested, mentionedUsers}) {
      return this.commentThreads.createCommentThread.perform({
        snapshotId,
        commentBody,
        areChangesRequested,
        mentionedUsers,
      });
    },

    createComment({commentThread, commentBody, mentionedUsers}) {
      return this.commentThreads.createComment.perform({
        commentThread,
        commentBody,
        mentionedUsers,
      });
    },

    closeCommentThread({commentThread}) {
      return this.commentThreads.closeCommentThread.perform({commentThread});
    },
  },
});
