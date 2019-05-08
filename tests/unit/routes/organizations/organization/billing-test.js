/* eslint-disable no-unused-expressions */
import {expect} from 'chai';
import {it, describe, beforeEach} from 'mocha';
import {setupTest} from 'ember-mocha';
import sinon from 'sinon';
import setupFactoryGuy from 'percy-web/tests/helpers/setup-factory-guy';
import {make} from 'ember-data-factory-guy';
import faker from 'faker';

describe('BillingRoute', function() {
  let route;

  setupTest();

  beforeEach(function() {
    setupFactoryGuy(this);
    route = this.owner.lookup('route:organizations/organization/billing');
  });

  describe('actions', function() {
    let changeSubscriptionStub;
    let organization;

    beforeEach(function() {
      organization = make('organization', 'withPaidPlan');
      changeSubscriptionStub = sinon.stub();

      sinon.stub(route, 'modelFor').returns({organization});
      route.set('subscriptionService', {
        changeSubscription: changeSubscriptionStub,
      });
    });

    describe('#updateEmail', function() {
      it('calls save on provided object', async function() {
        const saveStub = sinon.stub();
        await route.send('updateEmail', {save: saveStub});
        expect(saveStub).to.have.been.called;
      });
    });

    describe('#updateSubscription', function() {
      let newPlanId;
      let token;

      it('calls changeSubscription on subscriptionService', async function() {
        newPlanId = faker.lorem.word(2).dasherize();
        token = faker.random.uuid();
        await route.send('updateSubscription', newPlanId, token);
        expect(changeSubscriptionStub).to.have.been.calledWith(organization, newPlanId, token);
      });
    });

    describe('#updateCreditCard', function() {
      it('creates token and calls changeSubscription on subscriptionService', async function() {
        const planId = faker.lorem.word(2).dasherize();
        const fakeStripeElement = faker.lorem.word(4);
        const token = faker.random.uuid();
        const createTokenStub = sinon.stub().returns({token});
        route.set('stripe', {createToken: createTokenStub});

        await route.send('updateCreditCard', fakeStripeElement, planId);
        expect(createTokenStub).to.have.been.calledWith(fakeStripeElement);
        expect(changeSubscriptionStub).to.have.been.calledWith(organization, planId, token);
      });
    });
  });
});
