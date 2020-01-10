import {it, describe, beforeEach} from 'mocha';
import {setupRenderingTest} from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import {make} from 'ember-data-factory-guy';
import UsageNotificationSettingForm from 'percy-web/tests/pages/components/forms/usage-notification-setting'; // eslint-disable-line
import BillingSection from 'percy-web/tests/pages/components/organizations/billing-section';
import setupFactoryGuy from 'percy-web/tests/helpers/setup-factory-guy';
import percySnapshot from '@percy/ember';
import mockStripeService from 'percy-web/tests/helpers/mock-stripe-service';
import SetupLocalStorageSandbox from 'percy-web/tests/helpers/setup-localstorage-sandbox';
import {render} from '@ember/test-helpers';
import stubSession from 'percy-web/tests/helpers/stub-session';

describe('Integration: BillingSection', function() {
  SetupLocalStorageSandbox();
  setupRenderingTest('billing-section', {
    integration: true,
  });

  let organization;

  beforeEach(function() {
    setupFactoryGuy(this);
    mockStripeService(this);
  });

  describe('when currentUser is an Admin', function() {
    beforeEach(async function() {
      organization = make('organization', 'withPaidPlan', 'withAdminUser');
      stubSession(this, {currentUser: organization.organizationUsers.firstObject.user});
      this.set('organization', organization);
    });

    it('renders the admin view', async function() {
      await render(hbs`{{organizations/billing-section
        organization=organization}}`);

      expect(BillingSection.memberView.isVisible).to.equal(false);
      expect(BillingSection.adminView.isVisible).to.equal(true);

      await percySnapshot(this.test);
    });

    describe('subscription list', function() {
      async function _expectSubscriptionListVisibility(
        context,
        planTrait,
        {isVisible = true} = {},
      ) {
        const organization = make('organization', planTrait, 'withAdminUser');
        stubSession(context, {currentUser: organization.organizationUsers.firstObject.user});
        context.set('organization', organization);
        await context.render(hbs`{{organizations/billing-section
          organization=organization}}`);
        expect(BillingSection.subscriptionList.isVisible).to.equal(isVisible);
      }

      it('displays when plan is free', async function() {
        await _expectSubscriptionListVisibility(this, 'withFreePlan', {isVisible: true});
      });

      it('displays when plan is trial', async function() {
        await _expectSubscriptionListVisibility(this, 'withTrialPlan', {isVisible: true});
      });

      it('does display when plan is self serve v3', async function() {
        await _expectSubscriptionListVisibility(this, 'withPaidPlan', {isVisible: true});
      });

      it('displays when plan is legacy', async function() {
        await _expectSubscriptionListVisibility(this, 'withLegacyPlan', {isVisible: true});
      });

      it('does not display when plan is enterprise', async function() {
        await _expectSubscriptionListVisibility(this, 'withEnterprisePlan', {isVisible: false});
      });

      it('does not display when plan is sponsored', async function() {
        await _expectSubscriptionListVisibility(this, 'withSponsoredPlan', {isVisible: false});
      });
    });

    describe('billing settings', function() {
      async function _expectBillingSettingsVisibility(
        context,
        planTrait,
        {isVisible = false} = {},
      ) {
        organization.set('subscription', make('subscription', planTrait));
        await context.render(hbs`{{organizations/billing-section
          organization=organization
        }}`);

        expect(BillingSection.billingSettings.isVisible).to.equal(isVisible);
      }

      it('does not display when plan is free', async function() {
        await _expectBillingSettingsVisibility(this, 'withFreePlan', {isVisible: false});
      });

      it('does not display when plan is trial', async function() {
        await _expectBillingSettingsVisibility(this, 'withTrialPlan', {isVisible: false});
      });

      it('does not display when plan is sponsored', async function() {
        await _expectBillingSettingsVisibility(this, 'withSponsoredPlan', {isVisible: false});
      });

      it('displays when plan is paid', async function() {
        await _expectBillingSettingsVisibility(this, 'withPaidPlan', {isVisible: true});
      });

      it('displays when plan is paid+legacy', async function() {
        await _expectBillingSettingsVisibility(this, 'withLegacyPlan', {isVisible: true});
      });

      it('displays when plan is enterprise', async function() {
        await _expectBillingSettingsVisibility(this, 'withEnterprisePlan', {isVisible: true});
      });
    });
  });

  describe('when currentUser is a Member', function() {
    beforeEach(async function() {
      organization = make('organization', 'withPaidPlan', 'withUsers');
      stubSession(this, {currentUser: organization.organizationUsers.firstObject.user});
      this.setProperties({organization});
    });

    it('renders the member view', async function() {
      await render(hbs`{{organizations/billing-section
        organization=organization
       }}`);

      expect(BillingSection.memberView.isVisible).to.equal(true);
      expect(BillingSection.adminView.isVisible).to.equal(false);

      await percySnapshot(this.test);
    });
  });
});
