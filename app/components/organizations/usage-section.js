import Component from '@ember/component';
import {readOnly} from '@ember/object/computed';

export default Component.extend({
  organization: null,

  subscription: readOnly('organization.subscription'),
});
