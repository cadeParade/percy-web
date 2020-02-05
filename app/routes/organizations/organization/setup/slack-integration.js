import classic from 'ember-classic-decorator';
import {inject as service} from '@ember/service';
import {alias} from '@ember/object/computed';
import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

// Remove @classic when we can refactor away from mixins
@classic
export default class SlackIntegrationRoute extends Route.extend(AuthenticatedRouteMixin) {
  @service
  session;

  @service
  store;

  @service
  flashMessages;

  @alias('session.currentUser')
  currentUser;

  queryParams = {
    code: {},
    state: {},
    error: {},
  };

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
  }
}
