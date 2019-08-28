import Route from '@ember/routing/route';
import EnsureStatefulLogin from 'percy-web/mixins/ensure-stateful-login';
import {inject as service} from '@ember/service';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Route.extend(EnsureStatefulLogin, AuthenticatedRouteMixin, {
  session: service(),

  model() {
    // If we don't force reload user on this page,
    // we could display stale information about verified email addresses
    return this.session.forceReloadUser();
  },
});
