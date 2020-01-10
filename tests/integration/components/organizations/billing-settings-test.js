import {it, describe, beforeEach} from 'mocha';
import {setupRenderingTest} from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import {make} from 'ember-data-factory-guy';
import UsageNotificationSettingForm from 'percy-web/tests/pages/components/forms/usage-notification-setting'; // eslint-disable-line
import BillingSettings from 'percy-web/tests/pages/components/organizations/billing-settings';
import setupFactoryGuy from 'percy-web/tests/helpers/setup-factory-guy';
import percySnapshot from '@percy/ember';
import sinon from 'sinon';
import {defer, resolve} from 'rsvp';
import mockStripeService from 'percy-web/tests/helpers/mock-stripe-service';
import {render} from '@ember/test-helpers';

describe('Integration: BillingSettings', function() {
  setupRenderingTest('billing-settings', {
    integration: true,
  });

  beforeEach(function() {
    setupFactoryGuy(this);
    mockStripeService(this);
  });

  describe('when no inputs are showing', function() {
    it('it shows existing email address and card when they are both present', async function() {
      const organization = make('organization', 'withPaidPlan');
      this.setProperties({organization});
      await render(hbs`{{organizations/billing-settings
          organization=organization
        }}
      `);

      expect(BillingSettings.isEmailInfoVisible).to.equal(true);
      expect(BillingSettings.isCardInfoVisible).to.equal(true);

      await percySnapshot(this.test);
    });

    describe('when there is no payment method', function() {
      beforeEach(async function() {
        const organization = make('organization', 'withEnterprisePlan', 'withNoPaymentMethod');
        this.setProperties({organization});
        await render(hbs`{{organizations/billing-settings
            organization=organization
          }}
        `);
      });

      it('shows card empty state when card is not present', async function() {
        expect(BillingSettings.isEmailInfoVisible).to.equal(true);
        expect(BillingSettings.isEmptyCardInfoVisible).to.equal(true);

        await percySnapshot(this.test);
      });

      it('opens credit card form when "Add Card" is clicked', async function() {
        expect(BillingSettings.cardForm.isVisible).to.equal(false);
        await BillingSettings.openCardForm();
        expect(BillingSettings.cardForm.isVisible).to.equal(true);
      });
    });
  });

  describe('when opening the email edit form', function() {
    let subscriptionSaveStub;
    let organization;

    beforeEach(async function() {
      organization = make('organization', 'withPaidPlan');
      this.setProperties({organization});
      await render(hbs`{{organizations/billing-settings
          organization=organization
        }}
      `);
    });

    it('opens and closes email form', async function() {
      expect(BillingSettings.emailForm.isVisible).to.equal(false);
      await BillingSettings.openEmailForm();
      expect(BillingSettings.emailForm.isVisible).to.equal(true);
      await BillingSettings.emailForm.cancel();
      expect(BillingSettings.emailForm.isVisible).to.equal(false);
    });

    it('disables submit button when the email is invalid', async function() {
      await BillingSettings.openEmailForm();
      expect(BillingSettings.emailForm.isSubmitDisabled).to.equal(false);
      await BillingSettings.emailForm.enterEmail('not a valid email');
      expect(BillingSettings.emailForm.isSubmitDisabled).to.equal(true);
      await percySnapshot(this.test);
    });

    it('calls save on subscription when submit is clicked', async function() {
      const subscription = organization.subscription;
      subscriptionSaveStub = sinon.stub(subscription, 'save');

      await BillingSettings.openEmailForm();
      await BillingSettings.emailForm.submit();
      expect(subscriptionSaveStub).to.have.been.called;
    });

    it('calls shows flash message and closes form after save is successful', async function() {
      const subscription = organization.subscription;
      sinon.stub(subscription, 'save').returns(resolve());
      const flashMessageService = this.owner
        .lookup('service:flash-messages')
        .registerTypes(['success']);
      const flashMessageSuccessStub = sinon.stub(flashMessageService, 'success');

      await BillingSettings.openEmailForm();
      await BillingSettings.emailForm.submit();
      expect(flashMessageSuccessStub).to.have.been.called;
      expect(BillingSettings.emailForm.isVisible).to.equal(false);
    });

    it('shows button loading state when save is running', async function() {
      const deferred = defer();
      const subscription = organization.subscription;
      subscriptionSaveStub = sinon.stub(subscription, 'save').returns(deferred.promise);

      await BillingSettings.openEmailForm();
      await BillingSettings.emailForm.submit();
      expect(BillingSettings.emailForm.isSubmitLoading).to.equal(true);
    });
  });

  describe('when opening the credit card edit form', function() {
    beforeEach(async function() {
      const organization = make('organization', 'withPaidPlan');
      this.setProperties({organization});
      await render(hbs`{{organizations/billing-settings
          organization=organization
        }}
      `);
    });

    it('opens and closes card form', async function() {
      expect(BillingSettings.cardForm.isVisible).to.equal(false);
      await BillingSettings.openCardForm();
      await percySnapshot(this.test);
      expect(BillingSettings.cardForm.isVisible).to.equal(true);
      await BillingSettings.cardForm.cancel();
      expect(BillingSettings.cardForm.isVisible).to.equal(false);
    });
  });
});
