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
    if (params.error) {
      this.replaceWith('organizations.organization.integrations.slack', organization.get('slug'));
      this.get('flashMessages').danger(`There with your Slack authorization: ${params.error}`);
    }

    const newIntegration = this.get('store').createRecord('slack-integration', {
      code: params.code,
      state: params.state,
      organization: organization,
    });
    newIntegration.save().then(
      () => {
        organization.reload().then(() => {
          this.replaceWith(
            'organizations.organization.integrations.slack.slack-config',
            organization.get('slug'),
            newIntegration.id,
            'new',
          );
        });
      },
      error => {
        newIntegration.rollbackAttributes();
        this.replaceWith('organizations.organization.integrations.slack', organization.get('slug'));
        this.get('flashMessages').danger(`There was a problem connecting to Slack: ${error}`);
      },
    );
  },
});
