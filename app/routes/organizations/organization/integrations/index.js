import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import {hash} from 'rsvp';

import {INTEGRATION_TYPES} from 'percy-web/lib/integration-types';

export default Route.extend(AuthenticatedRouteMixin, {
  model() {
    const organization = this.modelFor('organizations.organization');
    const versionControlIntegrations = organization.get('versionControlIntegrations');
    const availableIntegrations = organization.get('availableIntegrations');

    return hash({
      organization,
      versionControlIntegrations,
      availableIntegrations,
    });
  },

  setupController(controller, model) {
    controller.setProperties({
      integrationItems: INTEGRATION_TYPES,
      organization: model.organization,
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
