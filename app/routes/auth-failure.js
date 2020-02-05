import {inject as service} from '@ember/service';
import Route from '@ember/routing/route';

import utils from 'percy-web/lib/utils';

export default class AuthFailureRoute extends Route {
  @service
  flashMessages;

  beforeModel() {
    let message = utils.getQueryParam('message');
    if (message === 'duplicate_email') {
      this.flashMessages.danger(
        'There was a problem with logging in. \
          The email you provided already exists.',
      );
    } else {
      this.flashMessages.danger(
        'There was a problem with logging in. \
          Please try again or contact us if the issue does not resolve.',
      );
    }

    this.transitionTo('index');
  }
}
