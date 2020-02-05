import classic from 'ember-classic-decorator';
import {inject as service} from '@ember/service';
import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import {hash} from 'rsvp';

// Remove @classic when we can refactor away from mixins
@classic
export default class SettingsRoute extends Route.extend(AuthenticatedRouteMixin) {
  @service
  flashMessages;

  @service
  intercom;

  model() {
    const project = this.modelFor('organization.project');
    const organization = this.modelFor('organization');

    return hash({project, organization});
  }
}
