import Component from '@ember/component';
import StripeOptions from 'percy-web/lib/stripe-elements-options';
import {readOnly} from '@ember/object/computed';

export default Component.extend({
  tagName: '',
  stripeOptions: StripeOptions,
  shouldShowCardInput: false,
  isUpdatingCard: false,
  _isCardComplete: false,
  isCardValid: readOnly('_isCardComplete'),
  planId: readOnly('organization.subscription.plan.id'),
  successFlashMessageText: 'Your card was updated successfully!',

  savingTask: null,
  isSaving: readOnly('savingTask.isRunning'),
  isSaveSuccessful: readOnly('savingTask.isSuccessful'),

  actions: {
    checkCard(event, cardDetails) {
      this.set('_isCardComplete', cardDetails.complete);
    },

    showCardInput() {
      this.set('shouldShowCardInput', true);
    },

    submitCardUpdate(stripeElement, planId) {
      const task = this.updateCreditCard(stripeElement, planId);
      this.set('savingTask', task);
      task.then(() => {
        this.set('shouldShowCardInput', false);
        this.flashMessages.success(this.successFlashMessageText);
      });
    },
  },
});
