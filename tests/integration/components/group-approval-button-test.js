/* jshint expr:true */
/* eslint-disable no-unused-expressions */
import {setupRenderingTest} from 'ember-mocha';
import {expect} from 'chai';
import {it, describe, beforeEach} from 'mocha';
import percySnapshot from '@percy/ember';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import {resolve, defer} from 'rsvp';
import GroupApprovalButton from 'percy-web/tests/pages/components/group-approval-button';
import {render} from '@ember/test-helpers';
import stubService from 'percy-web/tests/helpers/stub-service-integration';
import setupFactoryGuy from 'percy-web/tests/helpers/setup-factory-guy';
import {make, makeList} from 'ember-data-factory-guy';

describe('Integration: GroupApprovalButton', function () {
  setupRenderingTest('group-approval-button', {
    integration: true,
  });

  let createReviewStub;

  beforeEach(async function () {
    setupFactoryGuy(this);
    createReviewStub = sinon.stub().returns(resolve('resolve'));
    stubService(this, 'reviews', 'reviews', {
      createReview: {perform: createReviewStub},
    });
  });

  describe('when isGroupApproved is true', function () {
    const numTotalSnapshots = 'one million';
    beforeEach(async function () {
      this.setProperties({numTotalSnapshots});
      await render(hbs`<GroupApprovalButton
        @isGroupApproved={{true}}
        @numTotalSnapshots={{numTotalSnapshots}}
      />`);
    });

    it('displays approved bubble', async function () {
      expect(GroupApprovalButton.isApproved).to.equal(true);
      expect(GroupApprovalButton.approvedText).to.equal(`${numTotalSnapshots} changes approved`);
      await percySnapshot(this.test);
    });
  });

  describe('when isGroupApproved is false', function () {
    beforeEach(async function () {
      this.setProperties({
        isGroupApproved: false,
      });
    });

    describe('when isDisabled is true', function () {
      beforeEach(async function () {
        await render(hbs`<GroupApprovalButton
          @isGroupApproved={{isGroupApproved}}
          @isDisabled={{true}}
          @numUnapprovedSnapshots={{40}}
        />`);
      });

      it('displays as disabled when isDisabled is true', async function () {
        expect(GroupApprovalButton.isDisabled).to.equal(true);
        await percySnapshot(this.test);
      });

      it('does not take any action when clicking the disabled button', async function () {
        await GroupApprovalButton.clickButton();
        expect(createReviewStub).to.not.have.been.called;
      });
    });

    describe('when isDisabled is false', function () {
      const numUnapprovedSnapshots = 40;
      let approvableSnapshots;
      let build;

      beforeEach(async function () {
        build = make('build');
        approvableSnapshots = makeList('snapshot', 3, {build});
        this.setProperties({approvableSnapshots, numUnapprovedSnapshots});
        await render(hbs`<GroupApprovalButton
          @isGroupApproved={{isGroupApproved}}
          @isDisabled={{false}}
          @numUnapprovedSnapshots={{numUnapprovedSnapshots}}
          @approvableSnapshots={{approvableSnapshots}}
        />`);
      });

      it('displays the correct number of snapshots', async function () {
        expect(GroupApprovalButton.buttonText).to.equal(
          `Approve ${numUnapprovedSnapshots} changes`,
        );
      });

      it('calls approveGroup with unapproved snapshots', async function () {
        await GroupApprovalButton.clickButton();
        expect(createReviewStub).to.have.been.calledWith({
          snapshots: approvableSnapshots,
          build: sinon.match.object,
          eventData: sinon.match.object,
        });
      });

      it('displays a loading state', async function () {
        const deferred = defer();
        const createReviewStub = sinon.stub().returns(deferred.promise);
        const service = this.owner.lookup('service:reviews');
        service.set('createReview', {perform: createReviewStub});
        await GroupApprovalButton.clickButton();
        expect(GroupApprovalButton.isButtonLoading).to.equal(true);
        await percySnapshot(this.test);
      });
    });
  });
});
