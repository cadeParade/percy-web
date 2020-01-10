import {it, describe, beforeEach} from 'mocha';
import {setupRenderingTest} from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import setupFactoryGuy from 'percy-web/tests/helpers/setup-factory-guy';
import {make} from 'ember-data-factory-guy';
import BillingCardUpdater from 'percy-web/tests/pages/components/organizations/billing-card-updater'; // eslint-disable-line
import mockStripeService from 'percy-web/tests/helpers/mock-stripe-service';
import sinon from 'sinon';
import {resolve} from 'rsvp';
import {render} from '@ember/test-helpers';

describe('Integration: BillingCardUpdater', function() {
  setupRenderingTest('organizations/billing-card-updater', {
    integration: true,
  });

  let organization;
  beforeEach(function() {
    setupFactoryGuy(this);
    mockStripeService(this);
    organization = make('organization', 'withPaidPlan');
    this.setProperties({organization});
  });

  it('disables "Update Credit Card" button when card is not complete', async function() {
    await render(hbs`{{
      organizations/billing-card-updater
      organization=organization
      _isCardComplete=false
    }}`);

    expect(BillingCardUpdater.isSubmitCardButtonDisabled).to.equal(true);
  });

  it('enables "Update Credit Card" button when card is complete', async function() {
    await render(hbs`{{
      organizations/billing-card-updater
      organization=organization
      _isCardComplete=true
    }}`);

    expect(BillingCardUpdater.isSubmitCardButtonDisabled).to.equal(false);
  });

  it('calls hideForm when the cancel button is clicked', async function() {
    const hideFormStub = sinon.stub().returns(resolve());
    this.setProperties({hideFormStub});
    await render(hbs`{{
      organizations/billing-card-updater
      organization=organization
      hideForm=hideFormStub
    }}`);

    await BillingCardUpdater.cancel();
    expect(hideFormStub).to.have.been.called;
  });

  describe('submitting card', function() {
    let updateCreditCardStub;
    let hideFormStub;
    beforeEach(async function() {
      updateCreditCardStub = sinon.stub().returns(resolve());
      hideFormStub = sinon.stub().returns(resolve());
      this.setProperties({updateCreditCardStub, hideFormStub});
    });

    it('calls updateCreditCard when submitted', async function() {
      await render(hbs`{{
        organizations/billing-card-updater
        organization=organization
        updateCreditCard=updateCreditCardStub
        hideForm=hideFormStub
        _isCardComplete=true
      }}`);

      await BillingCardUpdater.clickSubmitCard();
      expect(updateCreditCardStub).to.have.been.calledWith(
        sinon.match.any,
        organization.subscription.plan.id,
      );
    });

    it('calls hideForm after save', async function() {
      await render(hbs`{{
        organizations/billing-card-updater
        organization=organization
        updateCreditCard=updateCreditCardStub
        hideForm=hideFormStub
        _isCardComplete=true
      }}`);

      await BillingCardUpdater.clickSubmitCard();
      expect(hideFormStub).to.have.been.called;
    });

    it('shows flashMessage after success', async function() {
      const flashMessageService = this.owner
        .lookup('service:flash-messages')
        .registerTypes(['success']);
      const flashMessageSuccessStub = sinon.stub(flashMessageService, 'success');

      await render(hbs`{{
        organizations/billing-card-updater
        organization=organization
        updateCreditCard=updateCreditCardStub
        hideForm=hideFormStub
        _isCardComplete=true
      }}`);

      await BillingCardUpdater.clickSubmitCard();
      expect(flashMessageSuccessStub).to.have.been.called;
    });

    it('shows button loading state when save task is running', async function() {
      const cardSaveTask = {isRunning: true};
      this.setProperties({cardSaveTask});
      await render(hbs`{{
        organizations/billing-card-updater
        organization=organization
        cardSaveTask=cardSaveTask
        _isCardComplete=true
      }}`);
      expect(BillingCardUpdater.isCardSubmitButtonLoading).to.equal(true);
    });
  });
});
