import classic from 'ember-classic-decorator';
import {action} from '@ember/object';
import {inject as service} from '@ember/service';
import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import utils from 'percy-web/lib/utils';

// Remove @classic when we can refactor away from mixins
@classic
export default class BitbucketCloudRoute extends Route.extend(AuthenticatedRouteMixin) {
  @service
  session;

  @service
  flashMessages;

  async beforeModel() {
    // If we don't force reload user on this page,
    // we don't get the associated Identities
    return await this.session.forceReloadUser();
  }

  @action
  deleteBitbucketCloud(bitbucketCloudIntegration) {
    let store = this.store;
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
  }
}
