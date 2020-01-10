import {it, describe, beforeEach} from 'mocha';
import {setupRenderingTest} from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import ConfirmDialog from 'percy-web/tests/pages/components/confirm-dialog';
import sinon from 'sinon';
import {defer} from 'rsvp';
import {initialize as emberKeyboardInitialize} from 'ember-keyboard';
import {render} from '@ember/test-helpers';

describe('Integration: Confirm Dialog', function() {
  setupRenderingTest('confirm-dialog', {
    integration: true,
  });

  let confirmService;
  let resolveSpy;

  beforeEach(function() {
    emberKeyboardInitialize();

    confirmService = this.owner.lookup('service:confirm');
    const deferredPromise = defer();
    resolveSpy = sinon.spy(deferredPromise, 'resolve');

    confirmService.setProperties({
      _deferred: deferredPromise,
      showPrompt: true,
      title: 'this is my title',
      message: 'this is my message',
    });
  });

  describe('confirm', function() {
    function expectConfirm(resolveSpy, confirmService) {
      expect(resolveSpy).to.have.been.calledWith(true);
      expect(confirmService.showPrompt).to.equal(false);
    }

    it('calls confirm action when "Continue" is clicked', async function() {
      await render(hbs`{{confirm-dialog}}`);
      await ConfirmDialog.confirm.click();
      expectConfirm(resolveSpy, confirmService);
    });

    it('calls confirm action when "Enter" is pressed', async function() {
      await render(hbs`{{confirm-dialog}}`);
      await ConfirmDialog.pressEnter();
      expectConfirm(resolveSpy, confirmService);
    });
  });

  describe('cancel', function() {
    function expectCancel(resolveSpy, confirmService) {
      expect(resolveSpy).to.have.been.calledWith(false);
      expect(confirmService.showPrompt).to.equal(false);
    }

    it('calls cancel action when "Cancel" is clicked', async function() {
      await render(hbs`{{confirm-dialog}}`);
      await ConfirmDialog.cancel.click();
      expectCancel(resolveSpy, confirmService);
    });

    it('calls cancel action when "Escape" is pressed', async function() {
      await render(hbs`{{confirm-dialog}}`);
      await ConfirmDialog.pressEscape();
      expectCancel(resolveSpy, confirmService);
    });
  });
});
