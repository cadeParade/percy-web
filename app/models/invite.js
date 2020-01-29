import Model, {attr, belongsTo} from '@ember-data/model';
import {computed} from '@ember/object';
import {readOnly} from '@ember/object/computed';
import {ROLE_ID_TO_TITLE} from './organization-user';

export default Model.extend({
  fromUser: belongsTo('user', {async: false}),
  organization: belongsTo('organization', {async: false}),

  createdAt: attr(),
  email: attr(),
  expiresAt: attr(),
  inviteLink: attr(),
  inviterName: readOnly('fromUser.name'),
  isExpired: attr('boolean'),
  role: attr(),

  // Only for creation:
  emails: attr(),
  roleTitle: computed('role', function() {
    return ROLE_ID_TO_TITLE[this.role];
  }),
});
