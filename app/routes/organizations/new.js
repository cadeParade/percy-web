import classic from 'ember-classic-decorator';
import {action, computed} from '@ember/object';
import {inject as service} from '@ember/service';
import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import {hash} from 'rsvp';

// Remove @classic when we can refactor away from mixins
@classic
export default class NewRoute extends Route.extend(AuthenticatedRouteMixin) {
  @service
  session;

  queryParams = {
    githubMarketplacePlanId: {as: 'marketplace_listing_plan_id', replace: true},
  };

  model() {
    const organization = this.store.createRecord('organization', {
      billingProvider: this._billingProvider,
      billingProviderData: this._billingProviderData,
    });
    const identities = this.get('session.currentUser.identities');
    const organizationsForUser = this.store.query('organization', {
      user: this.get('session.currentUser'),
    });
    return hash({
      organization,
      organizationsForUser,
      identities,
    });
  }

  setupController(controller, resolvedModel) {
    controller.setProperties({
      newOrganization: resolvedModel.organization,
      organizationsForUser: resolvedModel.organizationsForUser,
      identities: resolvedModel.identities,
    });
  }

  githubMarketplacePlanId = null;

  @computed('marketplaceListingPlanId')
  get _billingProvider() {
    let marketplaceListingPlanId = this.marketplaceListingPlanId;
    if (marketplaceListingPlanId) {
      return 'github_marketplace';
    } else {
      return '';
    }
  }

  @computed('marketplaceListingPlanId')
  get _billingProviderData() {
    let marketplaceListingPlanId = this.marketplaceListingPlanId;
    if (marketplaceListingPlanId) {
      return JSON.stringify({
        marketplace_listing_plan_id: parseInt(marketplaceListingPlanId),
      });
    } else {
      return '';
    }
  }

  @action
  async organizationCreated(organization, options) {
    const {isDemoRequest} = options;
    const orgSlug = organization.get('slug');
    await this.session.forceReloadUser();
    if (isDemoRequest) {
      this.transitionTo('organizations.organization.projects.new-demo', orgSlug);
    } else {
      this.transitionTo('organizations.organization.index', orgSlug);
    }
  }
}
