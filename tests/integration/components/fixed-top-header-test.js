import {setupRenderingTest} from 'ember-mocha';
import {expect} from 'chai';
import {it, describe, beforeEach} from 'mocha';
import hbs from 'htmlbars-inline-precompile';
import {make} from 'ember-data-factory-guy';
import sinon from 'sinon';
import setupFactoryGuy from 'percy-web/tests/helpers/setup-factory-guy';
import stubService from 'percy-web/tests/helpers/stub-service-integration';
import {click} from '@ember/test-helpers';

describe('Integration: FixedTopHeader', function() {
  setupRenderingTest('fixed-top-header', {
    integration: true,
  });

  beforeEach(function() {
    setupFactoryGuy(this);
  });

  describe('dashboard link', function() {
    let redirectToProjectStub;
    let redirectToOrgStub;
    beforeEach(async function() {
      redirectToOrgStub = sinon.stub();
      redirectToProjectStub = sinon.stub();

      stubService(this, 'redirects', 'redirects', {
        redirectToDefaultOrganization: redirectToOrgStub,
        redirectToRecentProjectForOrg: redirectToProjectStub,
      });

      stubService(this, 'session', 'session', {
        isAuthenticated: true,
      });
    });

    it('calls redirectToRecentProjectForOrg', async function() {
      const currentOrganization = make('organization');
      this.setProperties({currentOrganization});
      await this.render(hbs`{{fixed-top-header
        currentOrganization=currentOrganization
        shouldDisplayDashboardLink=true
      }}`);
      await click('[data-test-dashboard-link]');
      expect(redirectToProjectStub, 'project').to.have.been.called;
    });

    it('calls redirectToOrg when currentOrganization does not exist', async function() {
      await this.render(hbs`{{fixed-top-header
        shouldDisplayDashboardLink=true
      }}`);
      await click('[data-test-dashboard-link]');
      expect(redirectToProjectStub, 'org').to.have.been.calledWith(null);
    });
  });
});
