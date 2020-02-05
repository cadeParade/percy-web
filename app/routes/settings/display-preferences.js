import classic from 'ember-classic-decorator';
import {inject as service} from '@ember/service';
import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

// Remove @classic when we can refactor away from mixins
@classic
export default class DisplayPreferencesRoute extends Route.extend(AuthenticatedRouteMixin) {
  @service
  session;

  model() {
    return this.session.currentUser;
  }
}
