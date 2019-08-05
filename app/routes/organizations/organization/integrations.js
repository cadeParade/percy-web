import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import utils from 'percy-web/lib/utils';
import {run} from '@ember/runloop';
import $ from 'jquery';
import {inject as service} from '@ember/service';

export default Route.extend(AuthenticatedRouteMixin, {
  flashMessages: service(),

  actions: {
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
    },
  },
});
