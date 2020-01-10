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

describe('Integration: GroupApprovalButton', function() {
  setupRenderingTest('group-approval-button', {
    integration: true,
  });

  let createReview;

  beforeEach(async function() {
    GroupApprovalButton.setContext(this);
    createReview = sinon.stub().returns(resolve());
    this.setProperties({createReview});
  });

  describe('when isGroupApproved is true', function() {
    const numTotalSnapshots = 'one million';
    beforeEach(async function() {
      this.setProperties({numTotalSnapshots});
      await render(hbs`{{group-approval-button
        isGroupApproved=true
        numTotalSnapshots=numTotalSnapshots
        createReview=createReview
      }}`);
    });

    it('displays approved bubble', async function() {
      expect(GroupApprovalButton.isApproved).to.equal(true);
      expect(GroupApprovalButton.approvedText).to.equal(`${numTotalSnapshots} changes approved`);
      await percySnapshot(this.test);
    });
  });

  describe('when isGroupApproved is false', function() {
    beforeEach(async function() {
      this.setProperties({
        isGroupApproved: false,
      });
    });

    describe('when isDisabled is true', function() {
      beforeEach(async function() {
        await render(hbs`{{group-approval-button
          isGroupApproved=isGroupApproved
          isDisabled=true
          createReview=createReview
          numUnapprovedSnapshots=40
        }}`);
      });

      it('displays as disabled when isDisabled is true', async function() {
        expect(GroupApprovalButton.isDisabled).to.equal(true);
        await percySnapshot(this.test);
      });

      it('does not take any action when clicking the disabled button', async function() {
        await GroupApprovalButton.clickButton();
        expect(createReview).to.not.have.been.called;
      });
    });

    describe('when isDisabled is false', function() {
      const numUnapprovedSnapshots = 40;
      const approvableSnapshots = ['a', 'b', 'c'];

      beforeEach(async function() {
        this.setProperties({approvableSnapshots, numUnapprovedSnapshots});
        await render(hbs`{{group-approval-button
          isGroupApproved=isGroupApproved
          isDisabled=false
          createReview=createReview
          numUnapprovedSnapshots=numUnapprovedSnapshots
          approvableSnapshots=approvableSnapshots
        }}`);
      });

      it('displays the correct number of snapshots', async function() {
        expect(GroupApprovalButton.buttonText).to.equal(
          `Approve ${numUnapprovedSnapshots} changes`,
        );
      });

      it('calls approveGroup with unapproved snapshots', async function() {
        await GroupApprovalButton.clickButton();
        expect(createReview).to.have.been.calledWith(approvableSnapshots);
      });

      it('displays a loading state', async function() {
        const deferred = defer();
        const createReview = sinon.stub().returns(deferred.promise);
        this.set('createReview', createReview);

        await GroupApprovalButton.clickButton();
        expect(GroupApprovalButton.isButtonLoading).to.equal(true);
        await percySnapshot(this.test);
      });
    });
  });
});
