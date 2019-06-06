import Route from '@ember/routing/route';
import {inject as service} from '@ember/service';
import isUserMemberPromise from 'percy-web/lib/is-user-member-of-org';
import {hash} from 'rsvp';
import {REVIEW_COMMENT_TYPE, NOTE_COMMENT_TYPE} from 'percy-web/models/comment-thread';
import {task} from 'ember-concurrency';
import {pluralize} from 'ember-inflector';

export default Route.extend({
  snapshotQuery: service(),
  reviews: service(),
  confirm: service(),

  model(params) {
    const org = this.modelFor('organization');
    return hash({
      // Note: passing {reload: true} here to ensure a full reload including all sideloaded data.
      build: this.store.findRecord('build', params.build_id, {reload: true}),
      isUserMember: isUserMemberPromise(org),
    });
  },

  afterModel(model) {
    const controller = this.controllerFor(this.routeName);
    const build = model.build;
    controller.set('build', build);

    if (build && build.get('isFinished')) {
      controller.set('isSnapshotsLoading', true);

      this.get('snapshotQuery')
        .getChangedSnapshots(build)
        .then(() => {
          return this._initializeSnapshotOrdering();
        });
    }
  },

  setupController(controller, model) {
    this._super(...arguments);
    controller.set('build', model.build);
    controller.set('isBuildApprovable', model.isUserMember);
    controller.set('isUnchangedSnapshotsVisible', false);
  },

  _initializeSnapshotOrdering() {
    // this route path needs to be explicit so it will work with fullscreen snapshots.
    let controller = this.controllerFor('organization.project.builds.build');
    controller.initializeSnapshotOrdering();
  },

  actions: {
    updateIsHidingBuildContainer(isHidingBuildContainer) {
      const controller = this.controllerFor(this.routeName);
      controller.set('isHidingBuildContainer', isHidingBuildContainer);
    },

    initializeSnapshotOrdering() {
      this._initializeSnapshotOrdering();
    },

    didTransition() {
      this._super.apply(this, arguments);

      this.send('updateIsHidingBuildContainer', false);
    },

    openSnapshotFullModal(snapshotId, snapshotSelectedWidth, activeBrowser) {
      this.send('updateIsHidingBuildContainer', true);
      const build = this._getBuild();

      let organization = build.get('project.organization');
      let eventProperties = {
        project_id: build.get('project.id'),
        project_slug: build.get('project.slug'),
        build_id: build.get('id'),
        snapshot_id: snapshotId,
      };
      this.analytics.track('Snapshot Fullscreen Selected', organization, eventProperties);

      this.transitionTo(
        'organization.project.builds.build.snapshot',
        snapshotId,
        snapshotSelectedWidth,
        {
          queryParams: {mode: 'diff', activeBrowserFamilySlug: activeBrowser.get('familySlug')},
        },
      );
    },
    closeSnapshotFullModal() {
      const build = this._getBuild();
      this.send('updateIsHidingBuildContainer', false);
      this.transitionTo('organization.project.builds.build', build.get('id'));
    },

    async createReview(snapshots, eventData) {
      return this._createReview.perform({snapshots, eventData});
    },

    createCommentThread({snapshotId, commentBody, areChangesRequested}) {
      return this._createCommentThread.perform({snapshotId, commentBody, areChangesRequested});
    },

    createComment({commentThread, commentBody}) {
      return this._createComment.perform({commentThread, commentBody});
    },

    closeCommentThread({commentThread}) {
      return this._closeCommentThread.perform({commentThread});
    },
  },

  _createReview: task(function*({snapshots, eventData}) {
    const build = this._getBuild();

    if (this._snapshotsHaveOpenReviewThreads(snapshots)) {
      const result = yield this.confirm.ask({
        message: this._reviewConfirmMessage(snapshots, this._openReviewThreads(snapshots)),
      });

      return result ? yield this.reviews.createApprovalReview(build, snapshots, eventData) : false;
    } else {
      return yield this.reviews.createApprovalReview(build, snapshots, eventData);
    }
  }),

  _createComment: task(function*({commentThread, commentBody}) {
    const newComment = this.store.createRecord('comment', {
      commentThread: commentThread,
      body: commentBody,
    });
    return yield newComment.save().catch(() => {
      newComment.rollbackAttributes();
    });
  }),

  _createCommentThread: task(function*({snapshotId, commentBody, areChangesRequested}) {
    const newComment = this.store.createRecord('comment', {
      snapshotId,
      body: commentBody,
      threadType: areChangesRequested ? REVIEW_COMMENT_TYPE : NOTE_COMMENT_TYPE,
    });
    return yield newComment.save().catch(() => {
      newComment.rollbackAttributes();
    });
  }),

  _closeCommentThread: task(function*({commentThread}) {
    commentThread.set('closedAt', new Date());
    return yield commentThread.save().catch(() => {
      commentThread.rollbackAttributes();
    });
  }),

  _openReviewThreads(snapshots) {
    return snapshots.filterBy('isUnreviewed').reduce((acc, snapshot) => {
      return acc.concat(snapshot.commentThreads.filterBy('isResolvable')).toArray();
    }, []);
  },

  _snapshotsHaveOpenReviewThreads(snapshots) {
    return this._openReviewThreads(snapshots).length > 0;
  },

  _reviewConfirmMessage(snapshots, openReviewThreads) {
    const numSnapshotsToApprove = snapshots.length;
    const numOpenReviewThreads = openReviewThreads.length;
    const snapshotString = pluralize(numSnapshotsToApprove, 'snapshot', {withoutCount: true});
    const possessionString = numSnapshotsToApprove > 1 ? 'have' : 'has';
    const commentString = pluralize(numOpenReviewThreads, 'comment', {withoutCount: true});

    return `The ${snapshotString} you want to approve ${possessionString}
      unresolved ${commentString} requesting changes. Do you want to approve anyway?`;
  },

  // Use this instead of `modelFor(this.routeName)` because it returns a resolved build object
  // rather than a PromiseObject.
  _getBuild() {
    const controller = this.controllerFor(this.routeName);
    return controller.get('build');
  },
});
