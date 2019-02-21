import {validatePresence, validateFormat} from 'ember-changeset-validations/validators';

export default {
  displayThresholds: [
    validatePresence({presence: true, message: "Number of snapshots can't be blank."}),
    validateFormat({
      regex: /^[\d \n,]*$/,
      message: "Number of snapshots must be numbers separated by spaces (e.g. '5000, 30000')",
    }),
  ],
  displayEmails: [
    validatePresence({presence: true, message: "Email addresses can't be blank."}),
    validateFormat({
      regex: /.*[\w]+.*[@].*[.]\w.*/, // Super-basic regex. API does the full validation.
      message: 'Email addresses must be valid and separated by spaces.',
    }),
  ],
};
