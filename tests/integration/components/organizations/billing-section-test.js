import {it, describe, beforeEach} from 'mocha';
import {setupRenderingTest} from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import {make} from 'ember-data-factory-guy';
import UsageNotificationSettingForm from 'percy-web/tests/pages/components/forms/usage-notification-setting'; // eslint-disable-line
import BillingSection from 'percy-web/tests/pages/components/organizations/billing-section';
import setupFactoryGuy from 'percy-web/tests/helpers/setup-factory-guy';
import {percySnapshot} from 'ember-percy';

describe('Integration: BillingSection', function() {
  setupRenderingTest('billing-section', {
    integration: true,
  });

  let organization;

  beforeEach(function() {
    setupFactoryGuy(this);
    BillingSection.setContext(this);
  });

  describe('when currentUser is an Admin', function() {
    beforeEach(async function() {
      organization = make('organization', 'withPaidPlan');
      this.set('organization', organization);

      // To prevent an API call and setup for admin tests:
      organization.set('currentUserIsAdmin', true);
    });

    it('renders the admin view', async function() {
      await this.render(hbs`{{organizations/billing-section
        organization=organization}}`);

      expect(BillingSection.adminView.isVisible).to.equal(true);
      expect(BillingSection.memberView.isVisible).to.equal(false);

      await percySnapshot(this.test);
    });

    describe('with paid plan', function() {
      beforeEach(async function() {
        organization = make('organization', 'withPaidPlan');
        this.set('organization', organization);

        // To prevent an API call and setup for admin tests:
        organization.set('currentUserIsAdmin', true);
      });

      it('renders Usage Notification settings', async function() {
        await this.render(hbs`{{organizations/billing-section
            organization=organization}}`);

        expect(UsageNotificationSettingForm.isVisible).to.equal(true);

        await percySnapshot(this.test);
      });

      describe('when a setting exists', function() {
        it('renders the data for the setting', async function() {
          let setting = make('usage-notification-setting', {
            organization,
            thresholds: {'snapshot-count': ['1', '20', '33000']},
          });
          this.set('setting', setting);
          await this.render(hbs`{{organizations/billing-section
            organization=organization
            usageNotificationSetting=setting}}`);

          expect(UsageNotificationSettingForm.isVisible).to.equal(true);
          expect(UsageNotificationSettingForm.isVisible).to.equal(true);
          expect(UsageNotificationSettingForm.isEnabled).to.equal(true);
          expect(UsageNotificationSettingForm.emails.value).to.equal(setting.emails.join(' '));
          expect(UsageNotificationSettingForm.thresholds.value).to.equal('1 20 33,000');

          await percySnapshot(this.test);
        });
      });
    });

    describe('with a free plan', function() {
      beforeEach(async function() {
        organization = make('organization', 'withFreePlan');
        this.set('organization', organization);

        // To prevent an API call and setup for admin tests:
        organization.set('currentUserIsAdmin', true);
      });

      it('does not render Usage Notification settings', async function() {
        await this.render(hbs`{{organizations/billing-section
            organization=organization}}`);

        expect(UsageNotificationSettingForm.isVisible).to.equal(false);

        await percySnapshot(this.test);
      });
    });

    describe('with a trial plan', function() {
      beforeEach(async function() {
        organization = make('organization', 'withTrialPlan');
        this.set('organization', organization);

        // To prevent an API call and setup for admin tests:
        organization.set('currentUserIsAdmin', true);
      });

      it('does not render Usage Notification settings', async function() {
        await this.render(hbs`{{organizations/billing-section
            organization=organization}}`);

        expect(UsageNotificationSettingForm.isVisible).to.equal(false);

        await percySnapshot(this.test);
      });
    });

    describe('with a sponsored plan', function() {
      beforeEach(async function() {
        organization = make('organization', 'withSponsoredPlan');
        this.set('organization', organization);

        // To prevent an API call and setup for admin tests:
        organization.set('currentUserIsAdmin', true);
      });

      it('does not render Usage Notification settings', async function() {
        await this.render(hbs`{{organizations/billing-section
            organization=organization}}`);

        expect(UsageNotificationSettingForm.isVisible).to.equal(false);

        await percySnapshot(this.test);
      });
    });
  });

  describe('when currentUser is a Member', function() {
    beforeEach(async function() {
      organization = make('organization');
      this.set('organization', organization);

      // To prevent an API call and setup for non-admin tests:
      organization.set('currentUserIsAdmin', false);
    });

    it('renders the member view', async function() {
      await this.render(hbs`{{organizations/billing-section
        organization=organization
        currentUsageStats=currentUsageStats
        usageNotificationSetting=setting}}`);

      expect(BillingSection.memberView.isVisible).to.equal(true);
      expect(BillingSection.adminView.isVisible).to.equal(false);

      await percySnapshot(this.test);
    });
  });
});
