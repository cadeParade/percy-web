import classic from 'ember-classic-decorator';
import {inject as service} from '@ember/service';
import {alias} from '@ember/object/computed';
import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

// Remove @classic when we can refactor away from mixins
@classic
export default class BitbucketCloudIntegrationRoute extends Route.extend(AuthenticatedRouteMixin) {
  @service
  session;

  @service
  store;

  @service
  flashMessages;

  @alias('session.currentUser')
  currentUser;

  queryParams = {
    clientKey: {},
    error: {},
    error_description: {},
  };

  afterModel() {
    const params = this.paramsFor(this.routeName);
    const organization = this.modelFor('organizations.organization');

    // The 'access_denied' error happens if someone cancels out of authorizing Bitbucket Cloud
    if (params.error === 'access_denied') {
      this.replaceWith(
        'organizations.organization.integrations.bitbucket-cloud',
        organization.get('slug'),
      );
      return this.flashMessages.info('Bitbucket Cloud integration cancelled.');
    }
    // This handles any other error
    if (params.error) {
      this.replaceWith(
        'organizations.organization.integrations.bitbucket-cloud',
        organization.get('slug'),
      );
      return this.flashMessages.danger(
        `Error connecting to Bitbucket Cloud: ${params.error}: ${params.error_description}`,
      );
    }
    if (!params.clientKey) {
      this.replaceWith(
        'organizations.organization.integrations.bitbucket-cloud',
        organization.get('slug'),
      );
      return this.flashMessages.danger(
        'Error connecting to Bitbucket Cloud: clientKey is missing.',
      );
    }
    let integration = organization.bitbucketCloudIntegration;
    if (!integration) {
      integration = this.store.createRecord('version-control-integration', {
        integrationType: 'bitbucket_cloud',
        bitbucketCloudClientKey: params.clientKey,
        organization: organization,
      });
    }
    integration.save().then(
      () => {
        organization.reload().then(() => {
          this.replaceWith(
            'organizations.organization.integrations.bitbucket-cloud',
            organization.get('slug'),
          );
        });
      },
      error => {
        integration.rollbackAttributes();
        this.replaceWith(
          'organizations.organization.integrations.bitbucket-cloud',
          organization.get('slug'),
        );
        this.flashMessages.danger(`Error creating Bitbucket Integration. ${error}`);
      },
    );
  }
}
