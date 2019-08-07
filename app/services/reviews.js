import Service from '@ember/service';
import {inject as service} from '@ember/service';
import {Promise} from 'rsvp';

export default Service.extend({
  store: service(),
  analytics: service(),
  snapshotQuery: service(),

  async createApprovalReview(build, snapshots, eventData) {
    const review = this.store.createRecord('review', {
      build,
      snapshots,
      action: 'approve',
    });
    return await this._saveReview(review, build, eventData);
  },

  async createRejectReview(build, snapshots, eventData) {
    const review = this.get('store').createRecord('review', {
      build,
      snapshots,
      action: 'rejected',
    });
    return await this._saveReview(review, build, eventData);
  },

  async _saveReview(review, build, eventData) {
    await review.save();
    const refreshedBuild = this.store.findRecord('build', build.get('id'), {
      reload: true,
      include: 'approved-by',
    });
    const refreshedSnapshots = this.snapshotQuery.getChangedSnapshotsWithComments(build);
    await Promise.all([refreshedBuild, refreshedSnapshots]);

    if (eventData && eventData.title) {
      this._trackEventData(eventData, build);
    }

    return true;
  },

  _trackEventData(eventData, build) {
    this.get('analytics').track(
      eventData.title,
      build.get('project.organization'),
      eventData.properties,
    );
  },
});
