/* jshint expr:true */
/* eslint-disable no-unused-expressions */
import {setupRenderingTest} from 'ember-mocha';
import {expect} from 'chai';
import {it, describe, beforeEach} from 'mocha';
import percySnapshot from 'percy-web/tests/helpers/percy-snapshot';
import hbs from 'htmlbars-inline-precompile';
import {make, makeList} from 'ember-data-factory-guy';
import sinon from 'sinon';
import {resolve, defer} from 'rsvp';
import BuildApprovalButton from 'percy-web/tests/pages/components/build-approval-button';
import setupFactoryGuy from 'percy-web/tests/helpers/setup-factory-guy';
import {render} from '@ember/test-helpers';
import stubService from 'percy-web/tests/helpers/stub-service-integration';

describe('Integration: BuildApprovalButton', function () {
  setupRenderingTest('build-approval-button', {
    integration: true,
  });

  let build;
  let createReviewStub;

  beforeEach(function () {
    setupFactoryGuy(this);
    build = make('build', {snapshots: makeList('snapshot', 4)});
    createReviewStub = sinon.stub().returns(resolve('resolve'));
    this.setProperties({build});

    stubService(this, 'reviews', 'reviews', {
      createReview: {perform: createReviewStub},
    });
  });

  it('displays correctly when build is not approved ', async function () {
    await render(hbs`<BuildApprovalButton
      @build={{build}}
    />`);
    await percySnapshot(this.test, {darkMode: true});
  });

  it('displays correctly when build is approved', async function () {
    await render(hbs`<BuildApprovalButton
      @build={{build}}
    />`);
    this.set('build.reviewState', 'approved');
    await percySnapshot(this.test, {darkMode: true});
  });

  it('calls createReview with correct args when clicked', async function () {
    await render(hbs`<BuildApprovalButton
      @build={{build}}
    />`);
    await BuildApprovalButton.clickButton();
    expect(createReviewStub).to.have.been.calledWith({
      build: build,
    });
  });

  it('does not call createReview if build is already approved', async function () {
    const flashMessageService = this.owner.lookup('service:flash-messages').registerTypes(['info']);
    sinon.stub(flashMessageService, 'info');

    this.set('build.reviewState', 'approved');

    await render(hbs`<BuildApprovalButton
      @build={{build}}
    />`);

    await BuildApprovalButton.clickButton();
    expect(createReviewStub).to.not.have.been.called;
    expect(flashMessageService.info).to.have.been.calledWith('This build was already approved');
  });

  it('displays correctly when in loading state ', async function () {
    const deferred = defer();
    const createReviewStub = sinon.stub().returns(deferred.promise);
    const service = this.owner.lookup('service:reviews');
    service.set('createReview', {perform: createReviewStub});

    await render(hbs`<BuildApprovalButton
      @build={{build}}
    />`);

    await BuildApprovalButton.clickButton();
    await percySnapshot(this.test, {darkMode: true});
  });

  it('is enabled when isDisabled is false', async function () {
    await render(hbs`<BuildApprovalButton
      @build={{build}}
      @isDisabled={{false}}
    />`);

    expect(BuildApprovalButton.isDisabled).to.equal(false);
    await BuildApprovalButton.clickButton();
    expect(createReviewStub).to.have.been.called;
  });

  it('is disabled when isDisabled is true', async function () {
    await render(hbs`<BuildApprovalButton
      @build={{build}}
      @isDisabled={{true}}
    />`);
    expect(BuildApprovalButton.isDisabled).to.equal(true);
    await BuildApprovalButton.clickButton();
    expect(createReviewStub).to.not.have.been.called;
  });
});
