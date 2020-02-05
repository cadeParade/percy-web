import classic from 'ember-classic-decorator';
import {action} from '@ember/object';
import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import {hash} from 'rsvp';
import {INTEGRATION_TYPES} from 'percy-web/lib/integration-types';

// Remove @classic when we can refactor away from mixins
@classic
export default class GitlabCommonRoute extends Route.extend(AuthenticatedRouteMixin) {
  // REQUIRED: any routes that extend this must define currentIntegrationType
  currentIntegrationType = null;

  model() {
    const integrationModelAttribute = this._getIntegrationModelAttribute();
    const organization = this.modelFor('organizations.organization');
    const gitlabIntegration = organization.get(integrationModelAttribute);

    return hash({
      organization,
      gitlabIntegration,
    });
  }

  setupController(controller, model) {
    const currentGitlabIntegration = this._checkForGitlabIntegration(model);

    controller.setProperties({
      organization: model.organization,
      currentGitlabIntegration: currentGitlabIntegration,
    });
  }

  @action
  redirectToIntegrationsIndex() {
    this.transitionTo('organizations.organization.integrations.index');
  }

  @action
  willTransition() {
    let model = this.store.peekAll('version-control-integration').findBy('isNew', true);
    if (model) {
      this.store.unloadRecord(model);
    }
  }

  @action
  didTransition() {
    const organization = this.controller.get('organization');
    const friendlyName = this.controller.get('currentGitlabIntegration.friendlyName');

    if (friendlyName) {
      this.analytics.track(`Integrations ${friendlyName} Viewed`, organization);
    }

    return true;
  }

  _getIntegrationModelAttribute() {
    // returns the model attibute of the current integration type
    const integrationInfo = INTEGRATION_TYPES[this.currentIntegrationType];

    return integrationInfo.organizationModelAttribute;
  }

  _checkForGitlabIntegration(model) {
    // checks for and returns new or existing gitlab integration
    let currentGitlabIntegration;

    if (model.gitlabIntegration) {
      currentGitlabIntegration = model.gitlabIntegration;
    } else {
      currentGitlabIntegration = this.store.createRecord('version-control-integration', {
        integrationType: this.currentIntegrationType,
        organization: model.organization,
      });
    }

    return currentGitlabIntegration;
  }
}
