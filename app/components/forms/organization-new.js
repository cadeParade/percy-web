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
  userIdentities: null,

  isInputFocused: computed.not('needsGithubIdentity'),

  isSubmitDisabled: computed(
    'isFirstOrganization',
    'isOrgInvalid',
    'isEmailInvalid',
    'hasOnlyGithubIdentity',
    function() {
      const hasOnlyGithubIdentity = this.get('hasOnlyGithubIdentity');
      if (this.get('isFirstOrganization') && hasOnlyGithubIdentity) {
        return this.get('isOrgInvalid') || this.get('isEmailInvalid');
      } else {
        return this.get('isOrgInvalid');
      }
    },
  ),

  hasOnlyGithubIdentity: computed('userIdentities.@each.provider', function() {
    const userIdentities = this.get('userIdentities');
    const githubIdentity = userIdentities.findBy('isGithubIdentity');
    const auth0Identity = userIdentities.findBy('isAuth0Identity');
    return !!(githubIdentity && !auth0Identity);
  }),

  isOrgInvalid: or('changeset.isInvalid', 'changeset.isPristine'),
  isEmailInvalid: or('userChangeset.isInvalid'),

  userChangeset: computed('currentUser', function() {
    const validator = UserEmailValidations;
    return new Changeset(this.get('currentUser'), lookupValidator(validator), validator);
  }),

  actions: {
    async customSave() {
      // Save the organization
      // This calls save on forms/base.js, which this component inherits from.
      this.send('save');
      // If there's an email field, also save that.
      if (this.get('isFirstOrganization') && !this.get('userChangeset.isPristine')) {
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
