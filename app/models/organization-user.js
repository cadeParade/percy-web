import {computed} from '@ember/object';
import Model, {attr, belongsTo} from '@ember-data/model';
import {equal} from '@ember/object/computed';

export const ROLE_ID_TO_TITLE = {
  admin: 'Administrator',
  member: 'Member',
  billing_admin: 'Billing Admin',
};

export default Model.extend({
  organization: belongsTo('organization', {async: false}),
  user: belongsTo('user', {async: false, inverse: null}),

  createdAt: attr(),
  role: attr(),

  roleTitle: computed('role', function() {
    return ROLE_ID_TO_TITLE[this.role];
  }),
  isMember: equal('role', 'member'),
  isAdmin: equal('role', 'admin'),
});
