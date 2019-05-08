import Component from '@ember/component';
import {readOnly, or} from '@ember/object/computed';
import {inject as service} from '@ember/service';

export default Component.extend({
  subscriptionData: service(),
  organization: null,
  currentUsageStats: null,

  subscription: readOnly('organization.subscription'),

  isUserOrgAdmin: readOnly('organization.currentUserIsAdmin'),

  isEmailOrCardSaving: or('emailSaveTask.isRunning', 'cardSaveTask.isRunning'),
  actions: {
    async updateSavingState(emailSaveTask, cardSaveTask) {
      this.setProperties({emailSaveTask, cardSaveTask});
      await emailSaveTask;
      await cardSaveTask;
      this.setProperties({emailSaveTask: null, cardSaveTask: null});
    },
  },
});
