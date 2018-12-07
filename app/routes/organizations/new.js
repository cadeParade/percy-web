import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import {inject as service} from '@ember/service';
import {hash} from 'rsvp';
import {computed} from '@ember/object';

export default Route.extend(AuthenticatedRouteMixin, {
  session: service(),
  queryParams: {
    githubMarketplacePlanId: {as: 'marketplace_listing_plan_id', replace: true},
  },

  model() {
    const organization = this.store.createRecord('organization', {
      billingProvider: this.get('_billingProvider'),
      billingProviderData: this.get('_billingProviderData'),
    });
    const organizationsForUser = this.get('session.currentUser.organizations');
    return hash({
      organization,
      organizationsForUser,
    });
  },

  setupController(controller, resolvedModel) {
    controller.setProperties({
      newOrganization: resolvedModel.organization,
      organizationsForUser: resolvedModel.organizationsForUser,
    });
  },

  githubMarketplacePlanId: null,

  _billingProvider: computed('marketplaceListingPlanId', function() {
    let marketplaceListingPlanId = this.get('marketplaceListingPlanId');
    if (marketplaceListingPlanId) {
      return 'github_marketplace';
    }
  }),

  _billingProviderData: computed('marketplaceListingPlanId', function() {
    let marketplaceListingPlanId = this.get('marketplaceListingPlanId');
    if (marketplaceListingPlanId) {
      return JSON.stringify({
        marketplace_listing_plan_id: parseInt(marketplaceListingPlanId),
      });
    }
  }),

  actions: {
    organizationCreated(organization) {
      this.transitionTo('organizations.organization.index', organization.get('slug'));
    },
  },
});
