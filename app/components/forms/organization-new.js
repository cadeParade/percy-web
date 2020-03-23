import {computed} from '@ember/object';
import {and, equal, or, alias} from '@ember/object/computed';
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
    function () {
      const hasOnlyGithubIdentity = this.hasOnlyGithubIdentity;
      if (this.isFirstOrganization && hasOnlyGithubIdentity) {
        return this.isOrgInvalid || this.isEmailInvalid;
      } else {
        return this.isOrgInvalid;
      }
    },
  ),

  hasOnlyGithubIdentity: computed('userIdentities.@each.provider', function () {
    const userIdentities = this.userIdentities;
    const githubIdentity = userIdentities.findBy('isGithubIdentity');
    const auth0Identity = userIdentities.findBy('isAuth0Identity');
    return !!(githubIdentity && !auth0Identity);
  }),

  isOrgInvalid: or('changeset.isInvalid', 'changeset.isPristine'),
  isEmailInvalid: or('userChangeset.isInvalid', 'userChangeset.isPristine'),

  userChangeset: computed('currentUser', function () {
    const validator = UserEmailValidations;
    // Set this to nothing temporarily so we can get a new email address from them.
    this.set('currentUser.email', ''); // eslint-disable-line
    return new Changeset(this.currentUser, lookupValidator(validator), validator);
  }),

  _lastButtonClicked: null,
  _clickedDemo: equal('_lastButtonClicked', 'demo'),
  _clickedProject: equal('_lastButtonClicked', 'project'),

  isDemoSaving: and('_clickedDemo', 'isSaving'),
  isCustomProjectSaving: and('_clickedProject', 'isSaving'),

  isDemoDisabled: or('isSubmitDisabled', 'isCustomProjectSaving'),
  isCustomProjectDisabled: or('isSubmitDisabled', 'isDemoSaving'),

  async customSave({isDemoRequest = false} = {}) {
    // Save the organization
    // This calls save on forms/base.js, which this component inherits from.
    this.send('save', {isDemoRequest});
    // If there's an email field, also save that.
    if (this.isFirstOrganization) {
      try {
        const newEmail = this.get('userChangeset.email');
        await this.userChangeset.save();
        this.flashMessages.success(`Check ${newEmail} to verify it!`);
      } catch (e) {
        this.flashMessages.danger(`There was a problem updating your email: ${e}`);
      }
    }
  },

  actions: {
    handleSubmit(buttonValue) {
      this.set('_lastButtonClicked', buttonValue);
      this.customSave({isDemoRequest: buttonValue === 'demo'});
    },
  },
});
