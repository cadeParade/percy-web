/* eslint-disable no-unused-expressions */
import {expect} from 'chai';
import {it, describe} from 'mocha';
import {setupTest} from 'ember-mocha';

describe('SubscriptionDataService', function () {
  setupTest();
  it('exists', function () {
    let service = this.owner.lookup('service:subscription-data');
    expect(service).to.be;
    expect(service.DATA).to.be;
  });
});
