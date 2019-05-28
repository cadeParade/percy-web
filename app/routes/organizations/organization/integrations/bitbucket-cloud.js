import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import {inject as service} from '@ember/service';
import utils from 'percy-web/lib/utils';

export default Route.extend(AuthenticatedRouteMixin, {
  session: service(),
  flashMessages: service(),

  beforeModel() {
    // If we don't force reload user on this page,
    // we don't get the associated Identities
    return this.get('session').forceReloadUser();
  },

  actions: {
    deleteBitbucketCloud(bitbucketCloudIntegration) {
      let store = this.get('store');
      const confirmMessage = 'Are you sure you want to remove the Bitbucket Cloud integration?';
      if (utils.confirmMessage(confirmMessage)) {
        // Delete the record on the server
        // and remove the associated record from the store
        return bitbucketCloudIntegration
          .destroyRecord()
          .then(() => {
            store.unloadRecord(bitbucketCloudIntegration);
            this.transitionTo('organizations.organization.integrations.index');
          })
          .catch(() => {
            this.flashMessages.danger('Sorry, we encountered a problem. Please contact support.');
          });
      }
    },
  },
});
