import classic from 'ember-classic-decorator';
import {action} from '@ember/object';
import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

// Remove @classic when we can refactor away from mixins
@classic
export default class UsageRoute extends Route.extend(AuthenticatedRouteMixin) {
  // This model loads extra includes, so it requires that we're always using .slug
  // when using link-to into this route so that the model hook always fires.
  model() {
    const organization = this.modelFor('organizations.organization');
    const includes = 'usage-notification-setting,subscription.current-usage-stats';

    return this.store
      .loadRecord('organization', organization.id, {include: includes})
      .then(organization => {
        // If you want to access more relationships that belong to the
        // organization in this route, you must set them in setupController
        // or, for some reason, the relationship will be overwritten or dropped

        return {
          organization,
          usageStats: organization.subscription.currentUsageStats,
          usageNotificationSetting: organization.usageNotificationSetting,
        };
      });
  }

  setupController(controller, model) {
    controller.setProperties({
      organization: model.organization,
      currentUsageStats: model.usageStats,
      usageNotificationSetting: model.usageNotificationSetting,
    });
  }

  @action
  didTransition() {
    const organization = this.controller.organization;
    this.analytics.track('Usage Viewed', organization);
  }
}
