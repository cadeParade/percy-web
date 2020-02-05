import classic from 'ember-classic-decorator';
import {action} from '@ember/object';
import {inject as service} from '@ember/service';
import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import {task} from 'ember-concurrency';

// Remove @classic when we can refactor away from mixins
@classic
export default class BillingRoute extends Route.extend(AuthenticatedRouteMixin) {
  @service('subscriptions')
  subscriptionService;

  @service('stripev3')
  stripe;

  beforeModel() {
    return this.stripe.load();
  }

  // This model loads extra includes, so it requires that we're always using .slug
  // when using link-to into this route so that the model hook always fires.
  model() {
    const organization = this.modelFor('organizations.organization');
    const plan = organization.subscription.plan;
    // Don't include usage stats if we don't have to. That query is very slow.
    const baseIncludes = ['subscription.payment-method'];
    const usageStatsIncludes = ['subscription.current-usage-stats'];
    const shouldIncludeUsageStats = _shouldIncludeUsageStats(plan);
    const includes = shouldIncludeUsageStats
      ? baseIncludes.concat(usageStatsIncludes)
      : baseIncludes;

    return organization.sideload(includes.join(',')).then(organization => {
      // If you want to access more relationships that belong to the
      // organization in this route, you must set them in setupController
      // or, for some reason, the relationship will be overwritten or dropped
      return {
        organization,
        usageStats: shouldIncludeUsageStats ? organization.subscription.currentUsageStats : null,
      };
    });
  }

  setupController(controller, model) {
    controller.setProperties({
      organization: model.organization,
      currentUsageStats: model.usageStats,
    });
  }

  @action
  didTransition() {
    const organization = this.controller.organization;
    this.analytics.track('Billing Viewed', organization);
  }

  @action
  updateEmail(subscriptionChangeset) {
    return this._saveEmail.perform(subscriptionChangeset);
  }

  @action
  updateSubscription(planId, token) {
    return this._updateSubscription.perform(planId, token);
  }

  @action
  updateCreditCard(stripeElement, planId) {
    return this._updateCreditCard.perform(stripeElement, planId);
  }

  @task(function*(subscriptionChangeset) {
    yield subscriptionChangeset.save();
  })
  _saveEmail;

  @task(function*(stripeElement, planId) {
    const response = yield this.stripe.createToken(stripeElement);
    return this._updateSubscription.perform(planId, response.token);
  })
  _updateCreditCard;

  @task(function*(planId, token) {
    const organization = this.modelFor(this.routeName).organization;
    const subscriptionService = this.subscriptionService;

    yield subscriptionService.changeSubscription(organization, planId, token);
  })
  _updateSubscription;
}

function _shouldIncludeUsageStats(plan) {
  return plan.isCurrentPaidPlan || (plan.isDeprecated && plan.hasAmount);
}
