import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

import {INTEGRATION_TYPES} from 'percy-web/lib/integration-types';

export default Route.extend(AuthenticatedRouteMixin, {
  model() {
    return this.modelFor('organizations.organization.integrations');
  },

  setupController(controller, model) {
    controller.setProperties({
      integrationItems: INTEGRATION_TYPES,
      organization: model,
      versionControlIntegrations: model.versionControlIntegrations,
      availableIntegrations: model.availableIntegrations,
    });
  },

  actions: {
    didTransition() {
      const organization = this.controller.get('organization');

      if (organization) {
        this.analytics.track('Integrations Index Viewed', organization);
      }

      return true;
    },
  },
});
