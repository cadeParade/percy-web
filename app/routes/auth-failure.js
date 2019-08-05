import Route from '@ember/routing/route';
import {inject as service} from '@ember/service';

import utils from 'percy-web/lib/utils';

export default Route.extend({
  flashMessages: service(),
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
  },
});
