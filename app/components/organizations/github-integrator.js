import {alias} from '@ember/object/computed';
import {inject as service} from '@ember/service';
import Component from '@ember/component';
import utils from 'percy-web/lib/utils';
import PollingMixin from 'percy-web/mixins/polling';

export default Component.extend(PollingMixin, {
  store: service(),

  organization: null,
  classes: null,

  currentIntegration: alias('organization.githubIntegration'),
  shouldPollForUpdates: alias('organization.githubIntegrationRequest'),

  pollRefresh() {
    this.organization.reload().then(organization => {
      let githubIntegration = organization.get('githubIntegration');
      let githubIntegrationRequest = organization.get('githubIntegrationRequest');

      // If the has been fully installed or uninstalled, stop polling for updates.
      if (githubIntegration || (!githubIntegration && !githubIntegrationRequest)) {
        this.pollingTask.cancel();
      }
    });
  },

  actions: {
    cancelIntegrationRequest() {
      let integrationRequest = this.get('organization.githubIntegrationRequest');
      integrationRequest.set('_orgForAdapter', this.organization);
      integrationRequest.destroyRecord();
      this.pollingTask.cancel();
    },

    triggerInstallation() {
      let organization = this.organization;
      let githubIntegrationRequest = this.store.createRecord('github-integration-request', {
        _orgForAdapter: organization,
      });
      githubIntegrationRequest.save().then(() => {
        utils.replaceWindowLocation(githubIntegrationRequest.setupUrl);
      });
    },
  },
});
