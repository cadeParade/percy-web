import setupAcceptance, {setupSession} from '../helpers/setup-acceptance';
import freezeMoment from '../helpers/freeze-moment';
import {findAll} from '@ember/test-helpers';
import {isVisible as attacherIsVisible} from 'ember-attacher';
import moment from 'moment';
import BuildPage from 'percy-web/tests/pages/build-page';
import mockPusher from 'percy-web/tests/helpers/mock-pusher';

describe('Acceptance: Demo Project Build', function () {
  freezeMoment('2018-05-22');
  setupAcceptance();

  let urlParams;

  setupSession(function (server) {
    mockPusher(this);

    const organization = server.create('organization', 'withUser');

    const project = server.create('project', 'demo', {
      name: 'project-with-finished-build',
      organization,
    });

    const build = server.create('build', {
      project,
      createdAt: moment().subtract(2, 'minutes'),
      finishedAt: moment().subtract(5, 'seconds'),
      totalSnapshotsUnreviewed: 1,
      totalSnapshots: 1,
      totalComparisons: 1,
    });

    server.create('snapshot', 'withComparison', {build});

    urlParams = {
      orgSlug: organization.slug,
      projectSlug: project.slug,
      buildId: build.id,
    };
  });

  it('renders the tooltips', async function () {
    await BuildPage.visitBuild(urlParams);

    const tooltipElement = await findAll('.ember-attacher').firstObject;
    expect(BuildPage.demoTooltips.length).to.equal(5);
    // Anchors on snapshot viewers should be visible
    // This line checks that the index param is being passed correctly
    expect(BuildPage.demoTooltips[3].isAnchorVisible).to.equal(true);

    await BuildPage.demoTooltips.objectAt(0).clickAnchor();
    expect(attacherIsVisible(tooltipElement)).to.equal(true);
  });

  // This test is flaky on CI
  it.skip('moves on to the next tooltip when clicking next', async function () {
    await BuildPage.visitBuild(urlParams);

    const tooltipElements = await findAll('.ember-attacher .nextable');
    const firstTooltip = tooltipElements[0];
    const secondTooltip = tooltipElements[1];

    expect(BuildPage.demoTooltips.length).to.equal(6);
    expect(BuildPage.nextableDemoTooltips.length).to.equal(4);

    await BuildPage.nextableDemoTooltips.objectAt(0).clickAnchor();

    expect(firstTooltip.classList.contains('ember-attacher-show')).to.equal(true);
    expect(secondTooltip.classList.contains('ember-attacher-hide')).to.equal(true);

    await BuildPage.nextableDemoTooltips.objectAt(0).clickNext();

    await expect(secondTooltip.classList.contains('ember-attacher-show')).to.equal(true);
  });

  it('hides all tooltips and all anchors when all are dismissed', async function () {
    await BuildPage.visitBuild(urlParams);

    expect(BuildPage.demoTooltips.length).to.equal(5);

    await BuildPage.demoTooltips.objectAt(0).clickAnchor();
    await BuildPage.demoTooltips.objectAt(0).clickDismissAll();

    // verify that all tooltips were dismissed
    BuildPage.demoTooltips.forEach(demoTooltip => {
      expect(demoTooltip.isAnchorVisible).to.equal(false, 'anchor should be hidden');
    });
  });
});
