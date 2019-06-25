import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import {hash} from 'rsvp';
import {inject as service} from '@ember/service';

export default Route.extend(AuthenticatedRouteMixin, {
  flashMessages: service(),
  intercom: service(),

  model() {
    const project = this.modelFor('organization.project');
    const organization = this.modelFor('organization');

    return hash({project, organization});
  },
});
