import {computed} from '@ember/object';
import {readOnly} from '@ember/object/computed';
import Model, {attr, belongsTo} from '@ember-data/model';
import {ROLE_ID_TO_TITLE} from './organization-user';

export default class Invite extends Model {
  @belongsTo('user', {async: false})
  fromUser;

  @belongsTo('organization', {async: false})
  organization;

  @attr()
  createdAt;

  @attr()
  email;

  @attr()
  expiresAt;

  @attr()
  inviteLink;

  @readOnly('fromUser.name')
  inviterName;

  @attr('boolean')
  isExpired;

  @attr()
  role;

  // Only for creation:
  @attr()
  emails;

  @computed('role')
  get roleTitle() {
    return ROLE_ID_TO_TITLE[this.role];
  }
}
