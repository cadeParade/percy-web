import EnsureStatefulLogin from 'percy-web/mixins/ensure-stateful-login';
import UnauthenticatedBaseRoute from 'percy-web/routes/unauthenticated-base';
import {inject as service} from '@ember/service';

export default UnauthenticatedBaseRoute.extend(EnsureStatefulLogin, {
  session: service(),
  beforeModel() {
    if (this.session.currentUser) {
      this.transitionTo('default-org');
    }
  },
  afterModel() {
    this.showSignUpModal({onCloseDestinationRoute: '/'});
  },
});
