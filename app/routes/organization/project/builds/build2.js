import Route from '@ember/routing/route';
import {inject as service} from '@ember/service';
import isUserMember from 'percy-web/lib/is-user-member-of-org';
import {hash} from 'rsvp';
import {REVIEW_COMMENT_TYPE, NOTE_COMMENT_TYPE} from 'percy-web/models/comment-thread';
import {task} from 'ember-concurrency';
import {SNAPSHOT_REJECTED_STATE, SNAPSHOT_REVIEW_STATE_REASONS} from 'percy-web/models/snapshot';

export default Route.extend({
  snapshotQuery: service(),
  session: service(),
  launchDarkly: service(),

  model(params) {
    const org = this.modelFor('organization');
    return hash({
      // Note: passing {reload: true} here to ensure a full reload including all sideloaded data.
      build: this.store.findRecord('build', params.build_id, {reload: true}),
      isUserMember: isUserMember(this.session.currentUser, org),
      snapshots: this.snapshotQuery.getChangedSnapshots(params.build_id),
    });
  },
  actions: {
    noop() {},
  },
});
