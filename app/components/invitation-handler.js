import {alias} from '@ember/object/computed';
import {inject as service} from '@ember/service';
import Component from '@ember/component';
import {task, all, timeout} from 'ember-concurrency';
import {MIN_FEEDBACK_DELAY_MS} from 'percy-web/lib/min-feedback-delay-ms';

export default Component.extend({
  invitation: null,
  session: service(),
  router: service(),
  currentUser: alias('session.currentUser'),

  flashMessages: service(),

  accept: task(function* () {
    try {
      const model = yield this.invitation.save();
      // Show loading state for at least MIN_FEEBACK_DELAY_MS
      // so the user can know something is happening
      yield all([timeout(MIN_FEEDBACK_DELAY_MS), model]);
      // get organization users
      yield this.session.forceReloadUser();
      this.router.transitionTo('organizations.organization.index', model.organization.slug);
    } catch (e) {
      this.flashMessages.danger(
        'Something went wrong! You might already be in this organization. ' +
          'Feel free to reach out to hello@percy.io for help.',
      );
    }
  }),

  actions: {
    logout() {
      this.session.invalidateAndLogout();
    },
  },
});
