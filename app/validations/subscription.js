import {validatePresence, validateFormat} from 'ember-changeset-validations/validators';

export default {
  billingEmail: [validatePresence(true), validateFormat({type: 'email'})],
};
