import Service from '@ember/service';
import {inject as service} from '@ember/service';

export default Service.extend({
  store: service(),
  analytics: service(),

  async createApprovalReview(build, snapshots, eventData) {
    const review = this.get('store').createRecord('review', {
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
    const refreshedBuild = await build.reload();
    await refreshedBuild.get('snapshots').reload();

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
