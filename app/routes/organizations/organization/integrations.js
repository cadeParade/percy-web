import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import utils from 'percy-web/lib/utils';
import {run} from '@ember/runloop';
import $ from 'jquery';

export default Route.extend(AuthenticatedRouteMixin, {
  actions: {
    connectSlackChannel() {
      $.ajax({
        type: 'POST',
        url: utils.buildApiUrl(
          'slackIntegrationRequests',
          this.paramsFor('organizations.organization').organization_id,
        ),
      }).done(response => {
        // Make sure Ember runloop knows about the ajax situation.
        run(() => {
          utils.replaceWindowLocation(response['slack_auth_url']);
        });
      });
    },
  },
});
