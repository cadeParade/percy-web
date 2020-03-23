import setupAcceptance, {setupSession} from '../helpers/setup-acceptance';
import {visit, currentRouteName, currentURL} from '@ember/test-helpers';
import SnapshotViewerFull from 'percy-web/tests/pages/components/snapshot-viewer-full';
import percySnapshot from 'percy-web/tests/helpers/percy-snapshot';

describe('Acceptance: Default comparison', function () {
  setupAcceptance();

  describe('redirect conditions', function () {
    let organization;
    let project;
    let build;
    let snapshot;
    let url;

    setupSession(function (server) {
      organization = server.create('organization', 'withUser');
      project = server.create('project', {organization});
      build = server.create('build', {project});
      snapshot = server.create('snapshot', {build});
      // eslint-disable-next-line
      url = `${organization.slug}/${project.slug}/builds/snapshot/${snapshot.id}/default-comparison`;
    });

    it('redirects to comparison with highest diff ratio', async function () {
      server.create('comparison', {
        headSnapshot: snapshot,
        diffRatio: 0.3,
        width: 1000,
      });

      server.create('comparison', {
        headSnapshot: snapshot,
        diffRatio: 0.8,
        width: 200,
      });

      await visit(url);
      expect(currentRouteName()).to.equal('organization.project.builds.build.snapshot');
      expect(SnapshotViewerFull.header.activeWidthButton.text).to.equal('200px');
      await percySnapshot(this.test);
    });

    it('redirects to comparison with biggest width', async function () {
      server.create('comparison', {
        headSnapshot: snapshot,
        diffRatio: 0.3,
        width: 200,
      });

      server.create('comparison', {
        headSnapshot: snapshot,
        diffRatio: 0.3,
        width: 1000,
      });

      await visit(url);
      expect(currentRouteName()).to.equal('organization.project.builds.build.snapshot');
      expect(SnapshotViewerFull.header.activeWidthButton.text).to.equal('1000px');
      await percySnapshot(this.test);
    });

    it('sets mode to diff when comparison has diff', async function () {
      server.create('comparison', {
        headSnapshot: snapshot,
        diffRatio: 0.3,
      });
      await visit(url);
      expect(currentRouteName()).to.equal('organization.project.builds.build.snapshot');
      expect(currentURL()).to.include('diff');
      expect(SnapshotViewerFull.header.isDiffComparisonModeSelected).to.equal(true);
      await percySnapshot(this.test);
    });

    it('sets mode to head when comparison has no diff', async function () {
      server.create('comparison', {
        headSnapshot: snapshot,
        diffRatio: null,
      });
      await visit(url);
      expect(currentRouteName()).to.equal('organization.project.builds.build.snapshot');
      expect(currentURL()).to.include('head');
      expect(SnapshotViewerFull.header.isHeadComparisonModeSelected).to.equal(true);
      await percySnapshot(this.test);
    });
  });
});
