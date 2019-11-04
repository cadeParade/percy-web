import Component from '@ember/component';
import PollingMixin from 'percy-web/mixins/polling';
import {inject as service} from '@ember/service';

export function areInstallationIdsEqual(installationId, otherInstallationId) {
  return installationId == otherInstallationId;
}
export default Component.extend(PollingMixin, {
  installationId: null,
  afterAppInstalled: null,
  session: service(),
  store: service(),

  shouldPollForUpdates: true,
  POLLING_INTERVAL_SECONDS: 1,
  MAX_UPDATE_POLLING_REQUESTS: 600,
  pollRefresh() {
    const orgUsers = this.session.currentUser.organizationUsers;
    const orgPromises = orgUsers.map(orgUser => {
      const orgId = orgUser.belongsTo('organization').id();
      return this.store.loadRecord('organization', orgId, {
        include: 'github-integration-request,version-control-integrations',
      });
    });

    Promise.all(orgPromises).then(orgs => {
      // Attempt to get the organization that matches the installationId
      // This may fail if we haven't received the webhook yet, or a fake param is used
      let installationId = this.installationId;
      let organization = orgs.find(org => {
        return areInstallationIdsEqual(
          org.get('githubIntegration.githubInstallationId'),
          installationId,
        );
      });

      if (organization) {
        this.afterAppInstalled(organization);
      }
    });
  },
});
