import {it, describe, beforeEach} from 'mocha';
import {setupRenderingTest} from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import {make} from 'ember-data-factory-guy';
import ProfileEditForm from 'percy-web/tests/pages/components/forms/profile-edit';
import {render} from '@ember/test-helpers';
import setupFactoryGuy from 'percy-web/tests/helpers/setup-factory-guy';

describe('Integration: ProfileEditForm', function () {
  setupRenderingTest('forms/profile-edit', {
    integration: true,
  });

  let user;
  beforeEach(function () {
    setupFactoryGuy(this);

    user = make('user', {name: 'Jamie Lannister', email: 'jamie@lannisters.net'});
    this.set('user', user);
  });

  it('displays user information in form fields', async function () {
    await render(hbs`<Forms::ProfileEdit @user={{user}} />`);
    expect(ProfileEditForm.emailInputContains).to.equal(user.get('email'));
    expect(ProfileEditForm.nameInputContains).to.equal(user.get('name'));
    expect(ProfileEditForm.isSubmitDisabled).to.equal(true);
    expect(ProfileEditForm.isUnverifiedEmailMessagePresent).to.equal(false);
  });

  it('enables the submit button when the name has been changed', async function () {
    await render(hbs`<Forms::ProfileEdit @user={{user}} />`);
    await ProfileEditForm.fillInName('big softie');

    expect(ProfileEditForm.isSubmitDisabled).to.equal(false);
  });

  it('enables the submit button when the email has been changed', async function () {
    await render(hbs`<Forms::ProfileEdit @user={{user}} />`);
    await ProfileEditForm.fillInEmail('foo@bar.com');

    expect(ProfileEditForm.isSubmitDisabled).to.equal(false);
  });

  it('shows a message when a user has an unverified email', async function () {
    const unverifiedEmail = 'lol@rofl.com';
    const unverifiedEmailUser = make('user', {unverifiedEmail: unverifiedEmail});
    this.set('unverifiedEmailUser', unverifiedEmailUser);
    await render(hbs`<Forms::ProfileEdit @user={{unverifiedEmailUser}} />`);

    expect(ProfileEditForm.isUnverifiedEmailMessagePresent).to.equal(true);
    expect(ProfileEditForm.unverifiedEmailMessageContains(unverifiedEmail)).to.equal(true);
  });
});
