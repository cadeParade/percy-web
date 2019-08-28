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
    code: {},
    state: {},
    error: {},
  },

  afterModel() {
    const params = this.paramsFor(this.routeName);
    const organization = this.modelFor('organizations.organization');

    // The 'access_denied' error happens if someone cancels out of authorizing Slack
    if (params.error === 'access_denied') {
      return this.replaceWith('organizations.organization.integrations.slack', organization.slug);
    }
    // This handles any other error
    if (params.error) {
      this.replaceWith('organizations.organization.integrations.slack', organization.slug);
      return this.flashMessages.danger(`There was a problem connecting to Slack: ${params.error}`);
    }

    const newIntegration = this.store.createRecord('slack-integration', {
      code: params.code,
      state: params.state,
      organization: organization,
    });
    newIntegration.save().then(
      () => {
        organization.reload().then(() => {
          this.replaceWith(
            'organizations.organization.integrations.slack.slack-config',
            organization.slug,
            newIntegration.id,
            'new',
          );
        });
      },
      error => {
        newIntegration.rollbackAttributes();
        this.replaceWith('organizations.organization.integrations.slack', organization.slug);
        this.flashMessages.danger(`There was a problem connecting to Slack: ${error}`);
      },
    );
  },
});
