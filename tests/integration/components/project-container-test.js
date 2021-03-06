import {setupRenderingTest} from 'ember-mocha';
import {expect} from 'chai';
import {it, describe, beforeEach} from 'mocha';
import percySnapshot from '@percy/ember';
import hbs from 'htmlbars-inline-precompile';
import {make, makeList} from 'ember-data-factory-guy';
import ProjectContainer from 'percy-web/tests/pages/components/project-container';
import sinon from 'sinon';
import setupFactoryGuy from 'percy-web/tests/helpers/setup-factory-guy';
import {selectChoose} from 'ember-power-select/test-support/helpers';
import {render} from '@ember/test-helpers';

const INFINITY_MODEL_STUB = {
  reachedInfinity: true,
  on: () => {},
  off: () => {},
};

describe('Integration: ProjectContainer', function () {
  setupRenderingTest('project-container', {
    integration: true,
  });

  function stubPeekAllBuilds(builds, context) {
    const store = context.owner.lookup('service:store');
    sinon.stub(store, 'peekAll').returns(builds);
  }

  beforeEach(function () {
    setupFactoryGuy(this);
  });

  describe('without a repo', function () {
    beforeEach(async function () {
      const project = make('project');
      const builds = makeList('build', 1, {buildNumber: 1, project});
      stubPeekAllBuilds(builds, this);
      const infinityBuilds = Object.assign(builds, INFINITY_MODEL_STUB);
      const stub = sinon.stub();
      this.setProperties({project, stub, infinityBuilds});

      await render(hbs`<ProjectContainer
        @project={{project}}
        @infinityBuilds={{infinityBuilds}}
        @pollRefresh={{stub}}
        @isUserMember={{true}}
      />`);
    });

    it('shows integration prompt banner', async function () {
      await percySnapshot(this.test.fullTitle());
      const project = this.get('project');
      expect(ProjectContainer.builds.length).to.equal(1);
      expect(project.get('isRepoConnected')).to.equal(false);

      expect(ProjectContainer.integrationPrompt.isVisible).to.equal(true);
    });
  });

  describe('with an empty repo source', function () {
    beforeEach(async function () {
      const organization = make('organization', 'withGithubIntegration');
      const project = make('project', 'withRepo', {organization});
      const builds = makeList('build', 1, 'withRepo', 'hasPullRequest', {buildNumber: 1, project});
      const infinityBuilds = Object.assign(builds, INFINITY_MODEL_STUB);
      const stub = sinon.stub();
      stubPeekAllBuilds(builds, this);
      this.setProperties({project, infinityBuilds, stub});

      await render(hbs`<ProjectContainer
        @project={{project}}
        @infinityBuilds={{infinityBuilds}}
        @pollRefresh={{stub}}
        @isUserMember={{true}}
      />`);
    });

    it('shows no logo', async function () {
      await percySnapshot(this.test.fullTitle());
      const project = this.get('project');
      expect(project.get('isRepoConnected')).to.equal(true);
      expect(project.get('isGithubRepo')).to.equal(false);
      expect(project.get('isGithubEnterpriseRepo')).to.equal(false);
      expect(project.get('isGithubRepoFamily')).to.equal(false);
      expect(project.get('isGitlabRepo')).to.equal(false);
      expect(ProjectContainer.builds.length).to.equal(1);
      expect(ProjectContainer.repoLinked.githubLogo.isVisible, 'github logo is visible').to.equal(
        false,
      );
      expect(ProjectContainer.repoLinked.gitlabLogo.isVisible, 'gitlab logo is visible').to.equal(
        false,
      );
    });
  });

  describe('with a github repo', function () {
    beforeEach(async function () {
      const organization = make('organization', 'withGithubIntegration');
      const project = make('project', 'withGithubRepo', {organization});
      const builds = makeList('build', 1, 'withGithubRepo', 'hasPullRequest', {
        buildNumber: 1,
        project,
      });
      const infinityBuilds = Object.assign(builds, INFINITY_MODEL_STUB);
      const stub = sinon.stub();
      stubPeekAllBuilds(builds, this);
      this.setProperties({project, infinityBuilds, stub});

      await render(hbs`<ProjectContainer
        @project={{project}}
        @infinityBuilds={{infinityBuilds}}
        @pollRefresh={{stub}}
        @isUserMember={{true}}
      />`);
    });

    it('shows the github logo', async function () {
      await percySnapshot(this.test.fullTitle());
      const project = this.get('project');
      expect(project.get('isRepoConnected')).to.equal(true);
      expect(project.get('isGithubRepo')).to.equal(true);
      expect(project.get('isGithubEnterpriseRepo')).to.equal(false);
      expect(project.get('isGithubRepoFamily')).to.equal(true);
      expect(project.get('isGitlabRepo')).to.equal(false);
      expect(ProjectContainer.builds.length).to.equal(1);
      expect(ProjectContainer.repoLinked.githubLogo.isVisible, 'github logo is visible').to.equal(
        true,
      );
      expect(
        ProjectContainer.repoLinked.gitlabLogo.isVisible,
        'gitlab logo is not visible',
      ).to.equal(false);
    });
  });

  describe('with a github enterprise repo', function () {
    beforeEach(async function () {
      const organization = make('organization', 'withGithubEnterpriseIntegration');
      const project = make('project', 'withGithubEnterpriseRepo', {organization});
      const builds = makeList('build', 1, 'withGithubEnterpriseRepo', 'hasPullRequest', {
        buildNumber: 1,
        project,
      });
      const infinityBuilds = Object.assign(builds, INFINITY_MODEL_STUB);
      const stub = sinon.stub();
      stubPeekAllBuilds(builds, this);
      this.setProperties({project, infinityBuilds, stub});

      await render(hbs`<ProjectContainer
        @project={{project}}
        @infinityBuilds={{infinityBuilds}}
        @pollRefresh={{stub}}
        @isUserMember={{true}}
      />`);
    });

    it('shows the github logo', async function () {
      await percySnapshot(this.test.fullTitle());
      const project = this.get('project');
      expect(project.get('isRepoConnected')).to.equal(true);
      expect(project.get('isGithubRepo')).to.equal(false);
      expect(project.get('isGithubEnterpriseRepo')).to.equal(true);
      expect(project.get('isGithubRepoFamily')).to.equal(true);
      expect(project.get('isGitlabRepo')).to.equal(false);
      expect(ProjectContainer.builds.length).to.equal(1);
      expect(
        ProjectContainer.repoLinked.githubLogo.isVisible,
        'github logo should be visible',
      ).to.equal(true);
      expect(
        ProjectContainer.repoLinked.gitlabLogo.isVisible,
        'gitlab logo should not be visible',
      ).to.equal(false);
    });
  });

  describe('with a gitlab repo', function () {
    beforeEach(async function () {
      const organization = make('organization', 'withGitlabIntegration');
      const project = make('project', 'withGitlabRepo', {organization});
      const builds = makeList('build', 1, 'withGitlabRepo', 'hasPullRequest', {
        buildNumber: 1,
        project,
      });
      const infinityBuilds = Object.assign(builds, INFINITY_MODEL_STUB);
      const stub = sinon.stub();
      stubPeekAllBuilds(builds, this);
      this.setProperties({project, infinityBuilds, stub});

      await render(hbs`<ProjectContainer
        @project={{project}}
        @infinityBuilds={{infinityBuilds}}
        @pollRefresh={{stub}}
        @isUserMember={{true}}
      />`);
    });

    it('shows the gitlab logo', async function () {
      await percySnapshot(this.test.fullTitle());
      const project = this.get('project');
      expect(project.get('isRepoConnected')).to.equal(true);
      expect(project.get('isGithubRepo')).to.equal(false);
      expect(project.get('isGithubEnterpriseRepo')).to.equal(false);
      expect(project.get('isGithubRepoFamily')).to.equal(false);
      expect(project.get('isGitlabRepo')).to.equal(true);
      expect(ProjectContainer.builds.length).to.equal(1);
      expect(
        ProjectContainer.repoLinked.gitlabLogo.isVisible,
        'gitlab logo is not visible',
      ).to.equal(true);
      expect(ProjectContainer.repoLinked.githubLogo.isVisible, 'github logo is visible').to.equal(
        false,
      );
    });
  });

  describe('when user is not member of org', function () {
    beforeEach(async function () {
      const organization = make('organization', 'withGithubIntegration');
      const project = make('project', 'withGithubRepo', {organization});
      const builds = makeList('build', 1, {project});
      const infinityBuilds = Object.assign(builds, INFINITY_MODEL_STUB);
      const stub = sinon.stub();
      stubPeekAllBuilds(builds, this);
      this.setProperties({project, infinityBuilds, stub});

      await render(hbs`<ProjectContainer
        @project={{project}}
        @infinityBuilds={{infinityBuilds}}
        @pollRefresh={{stub}}
        isUserMember=false
      />`);
    });

    it('displays notice that build is public', async function () {
      expect(ProjectContainer.isPublicProjectNoticeVisible).to.equal(true);
      await percySnapshot(this.test);
    });
  });

  describe('branch filter with github repo', function () {
    beforeEach(async function () {
      const project = make('project', 'withGithubRepo');
      const branch1Builds = makeList('build', 4, 'finished', 'unreviewed', {
        branch: 'branch-1',
        project,
      });
      const branch2Builds = makeList('build', 5, 'finished', 'unreviewed', {
        branch: 'branch-2',
        project,
      });
      const branch3Builds = makeList('build', 6, 'finished', 'unreviewed', {
        branch: 'branch-3',
        project,
      });
      const allBuilds = branch1Builds.concat(branch2Builds).concat(branch3Builds);
      const infinityBuilds = Object.assign(allBuilds, INFINITY_MODEL_STUB);
      infinityBuilds.reachedInfinity = false;
      const stub = sinon.stub();
      stubPeekAllBuilds(allBuilds, this);
      this.setProperties({project, infinityBuilds, stub});

      await render(hbs`<ProjectContainer
        @project={{project}}
        @infinityBuilds={{infinityBuilds}}
        @pollRefresh={{stub}}
        @isUserMember={{true}}
      />`);
    });

    it('filters branches by selected branch', async function () {
      expect(ProjectContainer.infinityLoader.isPresent).to.equal(true);

      await selectChoose('', 'branch-1');
      await percySnapshot(this.test);
      expect(ProjectContainer.builds.length).to.equal(4);
      expect(ProjectContainer.infinityLoader.isPresent).to.equal(false);

      await selectChoose('', 'All branches');
      expect(ProjectContainer.builds.length).to.equal(15);
      expect(ProjectContainer.infinityLoader.isPresent).to.equal(true);
    });
  });

  describe('branch filter without github repo', function () {
    beforeEach(async function () {
      const project = make('project');
      const branch1Builds = makeList('build', 4, 'finished', 'unreviewed', {
        branch: 'branch-1',
        project,
      });
      const branch2Builds = makeList('build', 5, 'finished', 'unreviewed', {
        branch: 'branch-2',
        project,
      });
      const branch3Builds = makeList('build', 6, 'finished', 'unreviewed', {
        branch: 'branch-3',
        project,
      });
      const allBuilds = branch1Builds.concat(branch2Builds).concat(branch3Builds);
      const infinityBuilds = Object.assign(allBuilds, INFINITY_MODEL_STUB);
      infinityBuilds.reachedInfinity = false;
      const stub = sinon.stub();
      stubPeekAllBuilds(allBuilds, this);
      this.setProperties({project, infinityBuilds, stub});

      await render(hbs`<ProjectContainer
        @project={{project}}
        @infinityBuilds={{infinityBuilds}}
        @pollRefresh={{stub}}
        @isUserMember={{true}}
      />`);
    });

    it('filters branches by selected branch', async function () {
      expect(ProjectContainer.infinityLoader.isPresent).to.equal(true);

      await selectChoose('', 'branch-1');
      await percySnapshot(this.test);
      expect(ProjectContainer.builds.length).to.equal(4);
      expect(ProjectContainer.infinityLoader.isPresent).to.equal(false);

      await selectChoose('', 'All branches');
      expect(ProjectContainer.builds.length).to.equal(15);
      expect(ProjectContainer.infinityLoader.isPresent).to.equal(true);
    });
  });

  describe('branch filter on a project with only 1 branch', function () {
    beforeEach(async function () {
      const project = make('project');
      const branch1Builds = makeList('build', 4, 'finished', 'unreviewed', {
        branch: 'branch-1',
        project,
      });
      const infinityBuilds = Object.assign(branch1Builds, INFINITY_MODEL_STUB);
      infinityBuilds.reachedInfinity = true;
      const stub = sinon.stub();
      stubPeekAllBuilds(branch1Builds, this);
      this.setProperties({project, infinityBuilds, stub});

      await render(hbs`<ProjectContainer
        @project={{project}}
        @infinityBuilds={{infinityBuilds}}
        @pollRefresh={{stub}}
        @isUserMember={{true}}
      />`);
    });

    it('does not show the branch filter', async function () {
      expect(ProjectContainer.isBranchSelectorVisible).to.equal(false);
      await percySnapshot(this.test);
    });
  });
});
