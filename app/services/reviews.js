import Service from '@ember/service';
import {inject as service} from '@ember/service';

export default Service.extend({
  store: service(),
  analytics: service(),

  createApprovalReview(build, snapshots, eventData) {
    const review = this.get('store').createRecord('review', {
      build,
      snapshots,
      action: 'approve',
    });
    return review.save().then(() => {
      build.reload().then(build => {
        build.get('snapshots').reload();

        if (eventData && eventData.title) {
          this.get('analytics').track(
            eventData.title,
            build.get('project.organization'),
            eventData.properties,
          );
        }
      });
    });
  },
});
