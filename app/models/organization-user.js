import {computed} from '@ember/object';
import {equal} from '@ember/object/computed';
import Model, {attr, belongsTo} from '@ember-data/model';

export const ROLE_ID_TO_TITLE = {
  admin: 'Administrator',
  member: 'Member',
  billing_admin: 'Billing Admin',
};

export default class OrganizationUser extends Model {
  @belongsTo('organization', {async: false})
  organization;

  @belongsTo('user', {async: false, inverse: null})
  user;

  @attr()
  createdAt;

  @attr()
  role;

  @computed('role')
  get roleTitle() {
    return ROLE_ID_TO_TITLE[this.role];
  }

  @equal('role', 'member')
  isMember;

  @equal('role', 'admin')
  isAdmin;
}
