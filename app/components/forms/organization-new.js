import {computed} from '@ember/object';
import {or, alias} from '@ember/object/computed';
import BaseFormComponent from './base';
import OrganizationNewValidations from 'percy-web/validations/organization-new';
import UserEmailValidations from 'percy-web/validations/user-email';
import Changeset from 'ember-changeset';
import lookupValidator from 'ember-changeset-validations';
import {inject as service} from '@ember/service';

export default BaseFormComponent.extend({
  session: service(),
  flashMessages: service(),
  currentUser: alias('session.currentUser'),

  validator: OrganizationNewValidations,

  model: null,
  isFirstOrganization: null,

  isSubmitDisabled: computed('isFirstOrganization', 'isOrgInvalid', 'isEmailInvalid', function() {
    if (this.get('isFirstOrganization')) {
      return this.get('isOrgInvalid') || this.get('isEmailInvalid');
    } else {
      return this.get('isOrgInvalid');
    }
  }),

  hasOnlyGithubIdentity: computed(
    'currentUser.githubIdentity',
    'currentUser.emailPasswordIdentity',
    async function() {
      const githubIdentity = await this.get('currentUser.githubIdentity');
      const auth0Identity = await this.get('currentUser.emailPasswordIdentity');
      return !!(githubIdentity && !auth0Identity);
    },
  ),

  isOrgInvalid: or('changeset.isInvalid', 'changeset.isPristine'),
  isEmailInvalid: or('userChangeset.isInvalid', 'userChangeset.isPristine'),

  userChangeset: computed('currentUser', function() {
    const validator = UserEmailValidations;
    this.set('currentUser.email', '');
    return new Changeset(this.get('currentUser'), lookupValidator(validator), validator);
  }),

  actions: {
    async customSave() {
      // Save the organization
      this.send('save');
      // If there's an email field, also save that
      if (this.get('isFirstOrganization')) {
        try {
          const newEmail = this.get('userChangeset.email');
          await this.get('userChangeset').save();
          this.get('flashMessages').success(`Check ${newEmail} to verify it!`);
        } catch (e) {
          this.get('flashMessages').danger(`There was a problem updating your email: ${e}`);
        }
      }
    },
  },
});
