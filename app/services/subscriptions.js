import Service, {inject as service} from '@ember/service';
import {get} from '@ember/object';

export default Service.extend({
  store: service(),
  flashMessages: service(),
  changeSubscription(organization, planId, token) {
    // Always create a new POST request to change subscription, don't modify the subscription
    // object directly unless just changing attributes.
    let subscription = this.get('store').createRecord('subscription', {
      organization: organization,
      billingEmail: organization.get('subscription.billingEmail'),
      plan: this._get_or_create_plan(planId),
      token: token && token.id,
    });
    let savingPromise = subscription.save();

    savingPromise.then(
      () => {},
      adapterErrors => {
        const firstError = get(adapterErrors, 'errors') && get(adapterErrors, 'errors')[0];
        const isQuotaError = get(firstError, 'status') === 'quota_exceeded';
        const quotaError = get(firstError, 'detail');
        const generalError =
          'A Stripe error occurred! Your card may have been declined. Please ' +
          'try again or contact us at support@percy.io and we will help you get set up.';
        this.get('flashMessages').createPersistentFlashMessage(
          {
            message: isQuotaError ? quotaError : generalError,
            type: 'danger',
          },
          {persistentReloads: 1},
        );
        location.reload();
      },
    );
    return savingPromise;
  },

  _get_or_create_plan(planId) {
    let plan = this.get('store').peekRecord('plan', planId);
    if (!plan) {
      plan = this.get('store').push({
        data: {
          id: planId,
          type: 'plan',
        },
      });
    }
    return plan;
  },
});
