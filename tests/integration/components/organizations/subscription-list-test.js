import {it, describe, beforeEach} from 'mocha';
import {setupRenderingTest} from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import setupFactoryGuy from 'percy-web/tests/helpers/setup-factory-guy';
import {make} from 'ember-data-factory-guy';
import SubscriptionList from 'percy-web/tests/pages/components/organizations/subscription-list';
import mockStripeService from 'percy-web/tests/helpers/mock-stripe-service';
import percySnapshot from '@percy/ember';
import sinon from 'sinon';
import {resolve} from 'rsvp';
import {render} from '@ember/test-helpers';

describe('Integration: SubscriptionList', function () {
  setupRenderingTest('organizations/subscription-list', {
    integration: true,
  });

  beforeEach(function () {
    setupFactoryGuy(this);
    mockStripeService(this);
  });

  describe('when org is on free plan', function () {
    _expectForFreeAndTrial('withFreePlan');
  });

  describe('when org is on trial plan', function () {
    _expectForFreeAndTrial('withTrialPlan');
  });

  describe('when org is on v3-self-serve plan', function () {
    _expectForPaidPlans('withPaidPlan');

    it('displays info for existing plan', async function () {
      const organization = make('organization', 'withBusinessPlan');
      this.set('organization', organization);
      await render(hbs`<Organizations::SubscriptionList
        @organization={{organization}}
      />`);
      expect(SubscriptionList.isPlanInfoVisible).to.equal(true);
      expect(SubscriptionList.planInfoText).to.include('849');
    });
  });
  describe('when org is on legacy plan', function () {
    _expectForPaidPlans('withLegacyPlan');

    it('displays info for default plan', async function () {
      const organization = make('organization', 'withLegacyPlan');
      this.set('organization', organization);
      await render(hbs`<Organizations::SubscriptionList
        @organization={{organization}}
      />`);
      expect(SubscriptionList.isPlanInfoVisible).to.equal(true);
      expect(SubscriptionList.planInfoText).to.include('29');
    });
  });

  async function _expectForFreeAndTrial(planTrait) {
    it('selects "Essential" plan by default', async function () {
      const organization = make('organization', planTrait);
      this.setProperties({organization});
      await render(hbs`<Organizations::SubscriptionList
        @organization={{organization}}
      />`);

      expect(SubscriptionList.isSmallPlanSelected).to.equal(true);
    });

    describe('submit button state', function () {
      beforeEach(async function () {
        const organization = make('organization', planTrait);
        this.setProperties({organization});
        // `_isCardComplete` is not part of the subscription-list api, but
        // we can't interact with the stripe card input in tests, so imitate the
        // card input being valid or not with `_isCardComplete`.
        this.set('_isCardComplete', false);
        await render(hbs`<Organizations::SubscriptionList
          @organization={{organization}}
          @_isCardComplete={{_isCardComplete}}
        />`);
      });

      it('is disabled when the credit card input is invalid', async function () {
        // Subscription should have a valid email by default.
        // Subscription should have small plan selected by default.
        await this.set('_isCardComplete', false);
        await SubscriptionList.selectSmallPlan();
        expect(SubscriptionList.isInputSubmitDisabled).to.equal(true);
      });

      it('is disabled when the email is invalid', async function () {
        // Subscription should have small plan selected by default.
        this.set('_isCardComplete', true);
        await SubscriptionList.enterBillingEmail('not a valid email address');
        await SubscriptionList.selectSmallPlan();
        await percySnapshot(this.test);
        expect(SubscriptionList.isInputSubmitDisabled).to.equal(true);
      });

      it('is enabled when a plan is selected, credit card and email are valid', async function () {
        // Subscription should have a valid email by default.
        // Subscription should have small plan selected by default.
        await SubscriptionList.selectSmallPlan();
        await this.set('_isCardComplete', true);
        expect(SubscriptionList.isInputSubmitDisabled).to.equal(false);
      });
    });

    describe('plan info', function () {
      beforeEach(async function () {
        const organization = make('organization', planTrait);
        this.set('organization', organization);

        await render(hbs`<Organizations::SubscriptionList
          @organization={{organization}}
        />`);
      });

      it('displays default plan info', async function () {
        expect(SubscriptionList.isPlanInfoVisible).to.equal(true);
      });

      it('displays plan info for selected plan when a is plan selected', async function () {
        await SubscriptionList.selectLargePlan();
        expect(SubscriptionList.isPlanInfoVisible).to.equal(true);
        expect(SubscriptionList.planInfoText).to.include('849');
        await SubscriptionList.selectSmallPlan();
        expect(SubscriptionList.isPlanInfoVisible).to.equal(true);
        expect(SubscriptionList.planInfoText).to.include('29');
      });
    });

    it('should show credit card and billing email inputs', async function () {
      const organization = make('organization', planTrait);
      this.set('organization', organization);

      await render(hbs`<Organizations::SubscriptionList
        @organization={{organization}}
      />`);
      expect(SubscriptionList.isCardInputVisible).to.equal(true);
      expect(SubscriptionList.isEmailInputVisible).to.equal(true);
    });

    describe('actions', function () {
      let updateEmail;
      let updateSubscription;
      let updateCreditCard;
      let updateSavingState;

      beforeEach(async function () {
        const organization = make('organization', planTrait);
        updateEmail = sinon.stub();
        updateSubscription = sinon.stub();
        updateCreditCard = sinon.stub();
        updateSavingState = sinon.stub();

        this.setProperties({
          organization,
          updateEmailStub: updateEmail,
          updateSubscriptionStub: updateSubscription,
          updateCreditCardStub: updateCreditCard,
          updateSavingStateStub: updateSavingState,
        });
      });

      describe('performing actions', function () {
        beforeEach(async function () {
          await render(hbs`<Organizations::SubscriptionList
            @organization={{organization}}
            @_isCardComplete={{_isCardComplete}}
            @updateEmail={{updateEmailStub}}
            @updateSubscription={{updateSubscriptionStub}}
            @updateCreditCard={{updateCreditCardStub}}
            @updateSavingState={{updateSavingStateStub}}
          />`);
        });

        describe('when entries are valid', function () {
          beforeEach(async function () {
            await SubscriptionList.selectSmallPlan();
            await this.set('_isCardComplete', true);
          });

          it('sends updateCreditCard and updateEmail actions when email is different', async function() { // eslint-disable-line
            await SubscriptionList.enterBillingEmail('aDifferentEmail@gmail.com');
            await SubscriptionList.submitInputs();

            expect(updateEmail).to.have.been.called;
            expect(updateCreditCard).to.have.been.called;
            expect(updateSubscription).to.not.have.been.called;
            expect(updateSavingState).to.have.been.called;
          });

          it('sends only updateCreditCard when email is same', async function () {
            await SubscriptionList.submitInputs();

            expect(updateEmail).to.not.have.been.called;
            expect(updateCreditCard).to.have.been.called;
            expect(updateSubscription).to.not.have.been.called;
            expect(updateSavingState).to.have.been.called;
          });
        });

        describe('when entries are not valid', function () {
          it('does not send actions', async function () {
            await SubscriptionList.submitInputs();

            expect(updateEmail).to.not.have.been.called;
            expect(updateCreditCard).to.not.have.been.called;
            expect(updateSubscription).to.not.have.been.called;
            expect(updateSavingState).to.not.have.been.called;
          });
        });
      });

      describe('waiting on actions', function () {
        // the save task properties are not part of the component API, but set them here to
        // mimic the tasks running.
        it('shows button loading state when card and email tasks are running', async function () {
          const emailSaveTask = {isRunning: true};
          const cardSaveTask = {isRunning: true};
          this.setProperties({emailSaveTask, cardSaveTask});
          await render(hbs`<Organizations::SubscriptionList
            @organization={{organization}}
            @_isCardComplete={{_isCardComplete}}
            @emailSaveTask={{emailSaveTask}}
            @cardSaveTask={{cardSaveTask}}
          />`);
          await percySnapshot(this.test);
          expect(SubscriptionList.isSubmitInputsButtonLoading).to.equal(true);
        });

        it('shows button loading state when card task is running', async function () {
          const emailSaveTask = {isRunning: false};
          const cardSaveTask = {isRunning: true};
          this.setProperties({emailSaveTask, cardSaveTask});
          await render(hbs`<Organizations::SubscriptionList
            @organization={{organization}}
            @_isCardComplete={{_isCardComplete}}
            @emailSaveTask={{emailSaveTask}}
            @cardSaveTask={{cardSaveTask}}
          />`);
          expect(SubscriptionList.isSubmitInputsButtonLoading).to.equal(true);
        });

        it('shows button loading state when email task is running', async function () {
          const emailSaveTask = {isRunning: true};
          const cardSaveTask = {isRunning: false};
          this.setProperties({emailSaveTask, cardSaveTask});
          await render(hbs`<Organizations::SubscriptionList
            @organization={{organization}}
            @_isCardComplete={{_isCardComplete}}
            @emailSaveTask={{emailSaveTask}}
            @cardSaveTask={{cardSaveTask}}
          />`);
          expect(SubscriptionList.isSubmitInputsButtonLoading).to.equal(true);
        });

        it('shows flash message after save is done', async function () {
          const flashMessageService = this.owner
            .lookup('service:flash-messages')
            .registerTypes(['success']);
          const flashMessageSuccessStub = sinon.stub(flashMessageService, 'success');
          this.set('actions', {
            updateEmail: sinon.stub().returns(resolve()),
            updateCreditCard: sinon.stub().returns(resolve()),
          });

          await render(hbs`<Organizations::SubscriptionList
            @organization={{organization}}
            @_isCardComplete={{true}}
            @updateEmail={{action "updateEmail"}}
            @updateCreditCard={{action "updateCreditCard"}}
          />`);
          await SubscriptionList.selectSmallPlan();
          await SubscriptionList.submitInputs();
          expect(flashMessageSuccessStub).to.have.been.called;
        });
      });
    });
  }

  async function _expectForPaidPlans(planTrait) {
    beforeEach(async function () {
      const organization = make('organization', planTrait);
      this.set('organization', organization);
    });

    it('should not show credit card and billing email inputs', async function () {
      await render(hbs`<Organizations::SubscriptionList
        @organization={{organization}}
      />`);
      expect(SubscriptionList.isCardInputVisible).to.equal(false);
      expect(SubscriptionList.isEmailInputVisible).to.equal(false);
    });

    describe('save button state', function () {
      beforeEach(async function () {
        await render(hbs`<Organizations::SubscriptionList
          @organization={{organization}}
        />`);
      });

      it('is disabled when the existing plan is selected', async function () {
        await SubscriptionList.selectSmallPlan();
        expect(SubscriptionList.isPlanSubmitDisabled).to.equal(planTrait === 'withPaidPlan');
      });

      it('is enabled when a different plan is selected', async function () {
        await SubscriptionList.selectMediumPlan();
        expect(SubscriptionList.isPlanSubmitDisabled).to.equal(false);
      });
    });

    describe('plan info', function () {
      beforeEach(async function () {
        await render(hbs`<Organizations::SubscriptionList
          @organization={{organization}}
        />`);
      });

      it('updates info when another plan is selected', async function () {
        await SubscriptionList.selectMediumPlan();
        expect(SubscriptionList.isPlanInfoVisible).to.equal(true);
        expect(SubscriptionList.planInfoText).to.include('349');
        await SubscriptionList.selectLargePlan();
        expect(SubscriptionList.isPlanInfoVisible).to.equal(true);
        expect(SubscriptionList.planInfoText).to.include('849');
      });
    });

    describe('actions', function () {
      let updateEmail;
      let updateSubscription;
      let updateCreditCard;

      beforeEach(async function () {
        updateEmail = sinon.stub();
        updateSubscription = sinon.stub().returns();
        updateCreditCard = sinon.stub();

        this.setProperties({
          updateEmailStub: updateEmail,
          updateSubscriptionStub: updateSubscription,
          updateCreditCardStub: updateCreditCard,
        });
      });
      describe('performing actions', function () {
        beforeEach(async function () {
          await render(hbs`<Organizations::SubscriptionList
            @organization={{organization}}
            @updateEmail={{updateEmailStub}}
            @updateSubscription={{updateSubscriptionStub}}
            @updateCreditCard={{updateCreditCardStub}}
          />`);
        });

        it('sends updateSubscription when entry is valid', async function () {
          await SubscriptionList.selectLargePlan();
          await SubscriptionList.submitNewPlan();

          expect(updateEmail).to.not.have.been.called;
          expect(updateCreditCard).to.not.have.been.called;
          expect(updateSubscription).to.have.been.called;
        });
      });

      describe('waiting on actions', function () {
        beforeEach(async function () {
          const subscriptionSaveTask = {isRunning: true};
          this.setProperties({subscriptionSaveTask});
          await render(hbs`<Organizations::SubscriptionList
            @organization={{organization}}
            @subscriptionSaveTask={{subscriptionSaveTask}}
          />`);
        });

        it('shows button loading state when task is running', async function () {
          expect(SubscriptionList.isSubmitNewPlanButtonLoading).to.equal(true);
        });

        it('shows flash message after save is done', async function () {
          const flashMessageService = this.owner
            .lookup('service:flash-messages')
            .registerTypes(['success']);
          const flashMessageSuccessStub = sinon.stub(flashMessageService, 'success');
          this.set('actions', {updateSubscription: sinon.stub().returns(resolve())});

          await render(hbs`<Organizations::SubscriptionList
            @organization={{organization}}
            @updateSubscription={{action "updateSubscription"}}
          />`);
          await SubscriptionList.selectMediumPlan();
          await SubscriptionList.submitNewPlan();
          expect(flashMessageSuccessStub).to.have.been.called;
        });
      });
    });
  }
});
