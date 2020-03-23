/* eslint-disable no-unused-expressions */
import {expect} from 'chai';
import {it, describe} from 'mocha';
import {setupTest} from 'ember-mocha';

describe('AnalyticsService', function () {
  setupTest();

  // Replace this with your real tests.
  it('exists', function () {
    let service = this.owner.factoryFor('service:analytics');
    expect(service).to.be.ok;
  });
});
