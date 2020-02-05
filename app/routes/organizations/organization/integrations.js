import classic from 'ember-classic-decorator';
import {action} from '@ember/object';
import {inject as service} from '@ember/service';
import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import utils from 'percy-web/lib/utils';
import {run} from '@ember/runloop';
import $ from 'jquery';

// Remove @classic when we can refactor away from mixins
@classic
export default class IntegrationsRoute extends Route.extend(AuthenticatedRouteMixin) {
  @service
  flashMessages;

  model() {
    const organization = this.modelFor('organizations.organization');
    return organization.sideload(
      'version-control-integrations,' +
        'github-integration-request.created-by,' +
        'saml-integration,' +
        'slack-integrations',
    );
  }

  @action
  connectSlackChannel() {
    const isAdmin = this.modelFor(this.routeName).get('currentUserIsAdmin');
    if (!isAdmin) {
      return this.flashMessages.danger(
        'Configuring Slack requires organization admin permissions.',
      );
    }

    $.ajax({
      type: 'POST',
      url: utils.buildApiUrl(
        'slackIntegrationRequests',
        this.paramsFor('organizations.organization').organization_id,
      ),
    })
      .done(response => {
        // Make sure Ember runloop knows about the ajax situation.
        run(() => {
          utils.replaceWindowLocation(response['slack_auth_url']);
        });
      })
      .fail(() => {
        this.flashMessages.danger(
          'There was a problem starting the process of authenticating with Slack.' +
            ' Please try again or contact customer support.',
        );
      });
  }
}
