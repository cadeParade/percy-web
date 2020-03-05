import setupAcceptance, {setupSession} from '../helpers/setup-acceptance';
import freezeMoment from '../helpers/freeze-moment';
import {
  currentRouteName,
  currentURL,
  findAll,
  visit,
  getContext,
  settled,
} from '@ember/test-helpers';
import {isVisible as attacherIsVisible} from 'ember-attacher';
import percySnapshot from 'percy-web/tests/helpers/percy-snapshot';
import {beforeEach, afterEach} from 'mocha';
import moment from 'moment';
import sinon from 'sinon';
import {TEST_IMAGE_URLS} from 'percy-web/mirage/factories/screenshot';
import {BUILD_STATES} from 'percy-web/models/build';
import {
  SNAPSHOT_APPROVED_STATE,
  SNAPSHOT_REJECTED_STATE,
  SNAPSHOT_REVIEW_STATE_REASONS,
} from 'percy-web/models/snapshot';
import BuildPage from 'percy-web/tests/pages/build-page';
import ProjectPage from 'percy-web/tests/pages/project-page';
import {PusherMock} from 'pusher-js-mock';
import utils from 'percy-web/lib/utils';
// eslint-disable-next-line
import {setupBrowserNavigationButtons} from 'ember-cli-browser-navigation-button-test-helper/test-support';
import withVariation from 'percy-web/tests/helpers/with-variation';

describe('Acceptance: InfinityBuild', function() {
  freezeMoment('2018-05-22');
  setupAcceptance();

  let urlParams
  setupSession(function(server) {
    withVariation(this.owner, 'snapshot-sort-api', true);

    const organization = server.create('organization', 'withUser');
    const project = server.create('project', {organization});
    const build = server.create('build', 'withTwoBrowsers', {project});

    const snapshotsWithDiffs = server.createList('snapshot', 10, 'withTwoBrowsers', {build});
    const snapshotsWithDiffsOneBrowser = server.create('snapshot', 'withDiffInOneBrowser', {build});
    // const snapshotWithComment = server.create('snapshot', 'withComments', {build});

    urlParams = {
      orgSlug: organization.slug,
      projectSlug: project.slug,
      buildId: build.id,
    };

  });

  it('does a thing', async function() {
    await BuildPage.visitBuild(urlParams);
    await percySnapshot(this.test);
    expect(false).to.equal(true);
  });
});
