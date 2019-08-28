import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Route.extend(AuthenticatedRouteMixin, {
  // This model loads extra includes, so it requires that we're always using .slug
  // when using link-to into this route so that the model hook always fires.
  model() {
    const organization = this.modelFor('organizations.organization');
    const includes = 'subscription.current-usage-stats';

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
          usageStats: organization.get('subscription.currentUsageStats'),
          usageNotificationSetting: organization.get('usageNotificationSetting'),
        };
      });
  },

  setupController(controller, model) {
    controller.setProperties({
      organization: model.organization,
      currentUsageStats: model.usageStats,
      usageNotificationSetting: model.usageNotificationSetting,
    });
  },

  actions: {
    didTransition() {
      const organization = this.controller.get('organization');
      this.analytics.track('Usage Viewed', organization);
    },
  },
});
