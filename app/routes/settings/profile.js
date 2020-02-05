import classic from 'ember-classic-decorator';
import {inject as service} from '@ember/service';
import Route from '@ember/routing/route';
import EnsureStatefulLogin from 'percy-web/mixins/ensure-stateful-login';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

// Remove @classic when we can refactor away from mixins
@classic
export default class ProfileRoute extends Route.extend(
  EnsureStatefulLogin,
  AuthenticatedRouteMixin,
) {
  @service
  session;

  model() {
    // If we don't force reload user on this page,
    // we could display stale information about verified email addresses
    return this.session.forceReloadUser();
  }
}
