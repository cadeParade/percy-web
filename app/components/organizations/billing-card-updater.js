import Component from '@ember/component';
import StripeOptions from 'percy-web/lib/stripe-elements-options';
import {readOnly} from '@ember/object/computed';
import {task, timeout} from 'ember-concurrency';

export default Component.extend({
  tagName: '',
  stripeOptions: StripeOptions,
  submitCardUpdate: null,
  _isCardComplete: false,

  isSaving: readOnly('cardSaveTask.isRunning'),
  isCardValid: readOnly('_isCardComplete'),
  planId: readOnly('organization.subscription.plan.id'),

  waitForStripeActions: task(function*() {
    return yield timeout(100);
  }),

  actions: {
    cancel() {
      this.waitForStripeActions.perform();
      this.hideForm();
    },
    checkCard(event, cardDetails) {
      this.set('_isCardComplete', cardDetails.complete);
    },

    submitCardUpdate(stripeElement, planId) {
      const task = this.updateCreditCard(stripeElement, planId);
      this.set('cardSaveTask', task);
      task.then(() => {
        this.hideForm();
        this.flashMessages.success('Your card was updated successfully.');
      });
    },
  },
});
