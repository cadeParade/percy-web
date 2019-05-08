import freezeMoment from '../helpers/freeze-moment';
import {percySnapshot} from 'ember-percy';
import {beforeEach, afterEach} from 'mocha';
import {currentRouteName} from '@ember/test-helpers';
import BillingPage from 'percy-web/tests/pages/organizations/billing-page';
import AdminMode from 'percy-web/lib/admin-mode';
import setupAcceptance, {
  setupSession,
  renderAdapterErrorsAsPage,
} from '../helpers/setup-acceptance';

describe('Acceptance: Billing', function() {
  setupAcceptance();
  freezeMoment('2020-01-30');

  let organization;

  describe('user is admin', function() {
    setupSession(function(server) {
      organization = server.create('organization', 'withAdminUser');
    });

    it('can update billing email', async function() {
      await BillingPage.visitBillingPage({orgSlug: organization.slug});
      expect(currentRouteName()).to.equal('organizations.organization.billing');

      await percySnapshot(this.test);
      await BillingPage.billingEditForm.enterEmail('a_valid_email@gmail.com');
      await BillingPage.billingEditForm.submit();
      expect(server.schema.subscriptions.first().billingEmail).to.equal('a_valid_email@gmail.com');

      await percySnapshot(this.test.fullTitle() + ' | ok modification');
      await renderAdapterErrorsAsPage(async () => {
        await BillingPage.billingEditForm.enterEmail('an invalid email@gmail.com');
        await BillingPage.billingEditForm.submit();
        expect(BillingPage.billingEditForm.errorText).to.equal('Billing email is invalid');
        expect(server.schema.subscriptions.first().billingEmail).to.equal(
          'a_valid_email@gmail.com',
        );
        return percySnapshot(this.test.fullTitle() + ' | invalid modification');
      });
    });
  });

  describe('user is member but not an admin', function() {
    setupSession(function(server) {
      organization = server.create('organization', 'withUser');
      server.create('project', {organization});
    });

    it('denies billing settings', async function() {
      await BillingPage.visitOrgSettings({orgSlug: organization.slug});
      expect(currentRouteName()).to.equal('organizations.organization.settings');
      await BillingPage.nav.clickBillingLink();
      expect(currentRouteName()).to.equal('organizations.organization.billing');

      await percySnapshot(this.test);
    });
  });

  describe('user is not member of organization but is in admin-mode', function() {
    let organization;
    setupSession(function(server) {
      organization = server.create('organization');
      server.create('project', {organization});
      server.create('user');
    });

    beforeEach(() => {
      AdminMode.setAdminMode();
    });

    afterEach(() => {
      AdminMode.clear();
    });

    it('shows billing page with warning message', async function() {
      await BillingPage.visitBillingPage({orgSlug: organization.slug});
      expect(currentRouteName()).to.equal('organizations.organization.billing');
      await percySnapshot(this.test.fullTitle() + ' | setup');
    });
  });
});
