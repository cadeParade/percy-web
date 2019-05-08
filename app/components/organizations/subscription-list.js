import Component from '@ember/component';
import {and, or, readOnly} from '@ember/object/computed';
import {inject as service} from '@ember/service';
import {computed} from '@ember/object';
import Changeset from 'ember-changeset';
import SubscriptionValidations from 'percy-web/validations/subscription';
import lookupValidator from 'ember-changeset-validations';
import StripeOptions from 'percy-web/lib/stripe-elements-options';
import {resolve} from 'rsvp';

export default Component.extend({
  subscriptionData: service(),
  flashMessages: service(),
  organization: null,
  updateEmail: null,
  updateSubscription: null,
  updateCreditCard: null,
  userSelectedPlanId: null,
  updateSavingState: () => {},
  _isCardComplete: false,
  stripeOptions: StripeOptions,

  plan: readOnly('subscription.plan'),
  subscription: readOnly('organization.subscription'),
  isCardValid: readOnly('_isCardComplete'),
  selectedPlanId: or('userSelectedPlanId', 'plan.id'),
  shouldShowInputs: readOnly('plan.isTrialOrFree'),
  isEmailValid: readOnly('subscriptionChangeset.isValid'),
  isSubmitWithoutInputsEnabled: readOnly('isNewPlanSelected'),
  isSubmitWithInputsEnabled: and('isEmailValid', 'isCardValid', 'isNewPlanSelected'),

  subscriptionSaveTask: null,
  isSubscriptionSaving: readOnly('subscriptionSaveTask.isRunning'),

  emailSaveTask: null,
  cardSaveTask: null,
  isEmailOrCardSaving: or('emailSaveTask.isRunning', 'cardSaveTask.isRunning'),

  subscriptionChangeset: computed(function() {
    const validator = SubscriptionValidations;
    return new Changeset(this.subscription, lookupValidator(validator), validator);
  }),

  selectedPlan: computed('userSelectedPlanId', 'plan.isTrialOrFree', function() {
    if (this.plan.isTrialOrFree && !this.userSelectedPlanId) {
      return null;
    } else {
      return this.subscriptionData.PLANS.findBy('id', this.selectedPlanId);
    }
  }),

  isNewPlanSelected: computed(
    'plan.{id,isTrialOrFree}',
    'selectedPlanId',
    'userSelectedPlanId',
    function() {
      if (this.plan.isTrialOrFree && this.userSelectedPlanId) {
        return true;
      } else {
        return this.plan.id !== this.selectedPlanId;
      }
    },
  ),

  actions: {
    checkCard(event, cardDetails) {
      if (cardDetails) {
        this.set('_isCardComplete', cardDetails.complete);
      }
    },

    clickNewPlan(planId) {
      this.set('userSelectedPlanId', planId);
    },

    // This form contains two inputs -- subscription billing email and the credit card info.
    // We can't handle these in one endpoint, so we're making two calls.
    async submitSubscriptionStart(stripeElement) {
      const cardSaveTask = this._saveCard(stripeElement, this.selectedPlanId);
      const emailSaveTask = this._saveBillingEmail(this.subscriptionChangeset);
      this.updateSavingState(emailSaveTask, cardSaveTask);
      await emailSaveTask;
      await cardSaveTask;
      this.flashMessages.success('Your subscription has been updated!');
    },

    async submitSubscriptionUpdate() {
      const subscriptionUpdateTask = this.updateSubscription(this.selectedPlanId);
      this.set('subscriptionSaveTask', subscriptionUpdateTask);
      await subscriptionUpdateTask;
      this.flashMessages.success('Your subscription has been updated.');
    },
  },

  _saveCard(stripeElement, planId) {
    const cardSaveTask = this.updateCreditCard(stripeElement, planId);
    this.set('cardSaveTask', cardSaveTask);
    return cardSaveTask;
  },

  _saveBillingEmail(subscriptionChangeset) {
    if (subscriptionChangeset.get('billingEmail') !== this.subscription.billingEmail) {
      const emailSaveTask = this.updateEmail(subscriptionChangeset);
      this.set('emailSaveTask', emailSaveTask);
      return emailSaveTask;
    } else {
      return resolve();
    }
  },
});
