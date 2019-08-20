import {validatePresence} from 'ember-changeset-validations/validators';

export default {
  name: [validatePresence(true)],
  slug: [validatePresence(true)],
  defaultBaseBranch: [validatePresence(true)],
};
