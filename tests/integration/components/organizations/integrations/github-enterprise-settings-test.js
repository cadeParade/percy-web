import {it, describe, beforeEach} from 'mocha';
import {setupRenderingTest} from 'ember-mocha';
import {make} from 'ember-data-factory-guy';
import percySnapshot from '@percy/ember';
import hbs from 'htmlbars-inline-precompile';
import setupFactoryGuy from 'percy-web/tests/helpers/setup-factory-guy';
import {render} from '@ember/test-helpers';

describe('Integration: GithubEnterpriseSettings', function () {
  setupRenderingTest('github-enterprise-settings', {
    integration: true,
  });

  beforeEach(function () {
    setupFactoryGuy(this);
  });

  describe('with a github enterprise integration', function () {
    beforeEach(function () {
      const user = make('user');
      const organization = make('organization', 'withGithubEnterpriseIntegration');
      user.set('organizations', [organization]);
      this.setProperties({user, organization});
    });

    it('renders', async function () {
      const isIntegrated = this.get('organization.isGithubEnterpriseIntegrated');
      expect(isIntegrated).to.equal(true);
      await render(hbs`<
        Organizations::Integrations::GithubEnterpriseSettings
        @currentUser={{user}}
        @organization={{organization}}
      />`);
      await percySnapshot(this.test);
    });
  });
});
