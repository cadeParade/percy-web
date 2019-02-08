import RepoIntegrator from 'percy-web/tests/pages/components/repo-integrator';
import {setupRenderingTest} from 'ember-mocha';
import {it, describe, beforeEach} from 'mocha';
import {make} from 'ember-data-factory-guy';
import {percySnapshot} from 'ember-percy';
import sinon from 'sinon';
import hbs from 'htmlbars-inline-precompile';
import setupFactoryGuy from 'percy-web/tests/helpers/setup-factory-guy';
import repoRefreshServiceStub from 'percy-web/tests/helpers/mock-repo-refresh-service';

describe('Integration: RepoIntegratorComponent', function() {
  setupRenderingTest('repo-integrator', {
    integration: true,
  });

  beforeEach(async function() {
    RepoIntegrator.setContext(this);
    setupFactoryGuy(this);
  });

  describe('with integrations', function() {
    beforeEach(async function() {
      const project = make('project');
      const organization = make('organization', 'withMultipleIntegrations');
      project.set('organization', organization);
      this.setProperties({project});
      repoRefreshServiceStub(this, null, null);
      await this.render(hbs`{{projects/repo-integrator project=project}}`);
    });

    it('renders with the repo selector closed', async function() {
      expect(RepoIntegrator.isRepoSelectorVisible).to.eq(true);

      await percySnapshot(this.test.fullTitle());
    });
  });

  describe('with no integrations', function() {
    let freshReposStub;
    beforeEach(async function() {
      const project = make('project');
      const organization = make('organization', {lastSyncedAt: undefined});
      project.set('organization', organization);

      this.setProperties({project});

      freshReposStub = sinon.stub();
      repoRefreshServiceStub(this, null, null, freshReposStub);

      await this.render(hbs`{{projects/repo-integrator project=project}}`);
    });

    it('displays no integrations message', async function() {
      expect(RepoIntegrator.isNoIntegrationsMessageVisible).to.equal(true);
      await percySnapshot(this.test.fullTitle());
    });

    it('does not call getFreshRepos', async function() {
      expect(freshReposStub).to.not.have.been.called;
    });
  });
});
