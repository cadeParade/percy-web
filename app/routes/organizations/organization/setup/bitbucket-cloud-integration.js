import {alias} from '@ember/object/computed';
import Route from '@ember/routing/route';
import {inject as service} from '@ember/service';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Route.extend(AuthenticatedRouteMixin, {
  session: service(),
  store: service(),
  flashMessages: service(),
  currentUser: alias('session.currentUser'),

  queryParams: {
    clientKey: {},
    error: {},
    error_description: {},
  },

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
  },
});
