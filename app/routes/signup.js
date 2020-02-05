import classic from 'ember-classic-decorator';
import {inject as service} from '@ember/service';
import EnsureStatefulLogin from 'percy-web/mixins/ensure-stateful-login';
import UnauthenticatedBaseRoute from 'percy-web/routes/unauthenticated-base';

// Remove @classic when we can refactor away from mixins
@classic
export default class SignupRoute extends UnauthenticatedBaseRoute.extend(EnsureStatefulLogin) {
  @service
  session;

  beforeModel() {
    if (this.session.currentUser) {
      this.transitionTo('default-org');
    }
  }

  afterModel() {
    this.showSignUpModal({onCloseDestinationRoute: '/'});
  }
}
