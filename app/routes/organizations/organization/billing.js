import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import {inject as service} from '@ember/service';
import {task} from 'ember-concurrency';

export default Route.extend(AuthenticatedRouteMixin, {
  subscriptionService: service('subscriptions'),
  stripe: service('stripev3'),

  beforeModel() {
    return this.stripe.load();
  },

  // This model loads extra includes, so it requires that we're always using .slug
  // when using link-to into this route so that the model hook always fires.
  model() {
    const organization = this.modelFor('organizations.organization');
    const plan = organization.subscription.plan;
    // Don't include usage stats if we don't have to. That query is very slow.
    const shouldIncludeUsageStats = _shouldIncludeUsageStats(plan);
    const includes = shouldIncludeUsageStats ? 'subscription.current-usage-stats' : '';

    return this.store
      .findRecord('organization', organization.id, {
        reload: true,
        include: includes,
      })
      .then(organization => {
        // If you want to access more relationships that belong to the
        // organization in this route, you must set them in setupController
        // or, for some reason, the relationship will be overwritten or dropped

        return {
          organization,
          usageStats: shouldIncludeUsageStats
            ? organization.get('subscription.currentUsageStats')
            : null,
        };
      });
  },

  setupController(controller, model) {
    controller.setProperties({
      organization: model.organization,
      currentUsageStats: model.usageStats,
    });
  },

  actions: {
    didTransition() {
      const organization = this.controller.organization;
      this.analytics.track('Billing Viewed', organization);
    },

    updateEmail(subscriptionChangeset) {
      return this._saveEmail.perform(subscriptionChangeset);
    },

    updateSubscription(planId, token) {
      return this._updateSubscription.perform(planId, token);
    },

    updateCreditCard(stripeElement, planId) {
      return this._updateCreditCard.perform(stripeElement, planId);
    },
  },

  _saveEmail: task(function*(subscriptionChangeset) {
    yield subscriptionChangeset.save();
  }),

  _updateCreditCard: task(function*(stripeElement, planId) {
    const response = yield this.stripe.createToken(stripeElement);
    return this._updateSubscription.perform(planId, response.token);
  }),

  _updateSubscription: task(function*(planId, token) {
    const organization = this.modelFor(this.routeName).organization;
    const subscriptionService = this.subscriptionService;

    yield subscriptionService.changeSubscription(organization, planId, token);
  }),
});

function _shouldIncludeUsageStats(plan) {
  return plan.isCurrentPaidPlan || (plan.isDeprecated && plan.hasAmount);
}
