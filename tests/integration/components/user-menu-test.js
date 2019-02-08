import {it, describe, beforeEach} from 'mocha';
import {make} from 'ember-data-factory-guy';
import {setupRenderingTest} from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import setupFactoryGuy from 'percy-web/tests/helpers/setup-factory-guy';
import Service from '@ember/service';
import userMenu from 'percy-web/tests/pages/components/user-menu';
import clickDropdownTrigger from 'percy-web/tests/pages/helpers/click-basic-dropdown-trigger';
import sinon from 'sinon';

describe('Integration: UserMenu', function() {
  setupRenderingTest('user-menu', {
    integration: true,
  });
  beforeEach(async function() {
    setupFactoryGuy(this);
    userMenu.setContext(this);
  });

  describe('logout', function() {
    let logoutStub;
    beforeEach(async function() {
      const currentUser = make('user');
      logoutStub = sinon.stub();
      const sessionServiceStub = Service.extend({
        currentUser,
        invalidateAndLogout: logoutStub,
      });
      this.owner.register('service:session', sessionServiceStub, 'sessionService');

      await this.render(hbs`{{user-menu user=currentUser}}`);
    });

    it('calls logout', async function() {
      await clickDropdownTrigger();
      await userMenu.logout();
      expect(logoutStub).to.have.been.called;
    });
  });
});
