import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import {inject as service} from '@ember/service';

export default Route.extend(AuthenticatedRouteMixin, {
  stripe: service('stripev3'),

  beforeModel() {
    return this.get('stripe').load();
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
  },
});

function _shouldIncludeUsageStats(plan) {
  return plan.isCurrentPaidPlan || (plan.isDeprecated && plan.hasAmount);
}
