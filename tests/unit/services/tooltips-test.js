import {expect} from 'chai';
import {it, describe, beforeEach} from 'mocha';
import {setupTest} from 'ember-mocha';
import localStorageProxy from 'percy-web/lib/localstorage';
import SetupLocalStorageSandbox from 'percy-web/tests/helpers/setup-localstorage-sandbox';
import {TOOLTIP_MASTER_KEY} from 'percy-web/services/tooltips';

describe('TooltipsService', function () {
  setupTest();
  SetupLocalStorageSandbox();

  let service;

  beforeEach(function () {
    localStorage.clear();
    service = this.owner.lookup('service:tooltips');
  });

  describe('init', function () {
    beforeEach(function () {
      localStorageProxy.set(TOOLTIP_MASTER_KEY, false);
    });

    it('sets allHidden to the TOOLTIP_MASTER_KEY value in localstorage', function () {
      expect(service.allHidden).to.equal(false);
    });
  });

  describe('hideAll', function () {
    it('changes allHidden to true and sets localStorage', function () {
      service.hideAll();

      const localStorageValue = localStorageProxy.get(TOOLTIP_MASTER_KEY);

      expect(service.allHidden).to.equal(true);
      expect(localStorageValue).to.equal(true);
    });
  });
});
