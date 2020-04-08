import {inject as service} from '@ember/service';
import Route from '@ember/routing/route';
import isUserMember from 'percy-web/lib/is-user-member-of-org';
import {hash} from 'rsvp';

export default class SnapshotRoute extends Route {
  @service
  snapshotQuery;

  @service
  commentThreads;

  @service
  store;

  @service
  flashMessages;

  @service
  session;

  queryParams = {
    currentWidth: {as: 'width', replace: true},
    comparisonMode: {as: 'mode', replace: true},
    activeBrowserFamilySlug: {as: 'browser', replace: true},
  };

  model(params) {
    const organization = this.modelFor('organization');
    return hash({
      snapshot: this.snapshotQuery.getSnapshot(params.snapshot_id),
      isUserMember: isUserMember(this.session.currentUser, organization),
    });
  }

  afterModel(resolvedModel) {
    const snapshotId = resolvedModel.snapshot.id;
    const build = this.modelFor('organization.project.builds.build');
    // do not return from this method so comments load in the background and
    // does not block template rendering.
    this.commentThreads.getCommentsForSnapshotIds([snapshotId], build);
  }

  setupController(controller, model) {
    super.setupController(...arguments);
    const params = this._params();
    const build = this.modelFor('organization.project.builds.build');
    const requestedBrowser = this.store
      .peekAll('browser')
      .findBy('familySlug', params.activeBrowserFamilySlug);

    const browser = this._validateBrowser(requestedBrowser, model.snapshot.build);
    const comparisonMode = this._validateComparisonMode(
      params.comparisonMode,
      model.snapshot,
      params.currentWidth,
      browser,
    );
    controller.setProperties({
      build,
      snapshot: model.snapshot,
      isBuildApprovable: model.isUserMember,
      activeBrowserFamilySlug: browser.familySlug,
      comparisonMode,
    });
  }

  _validateComparisonMode(comparisonMode, snapshot, width, browser) {
    const selectedComparison = snapshot.comparisons.find(comparison => {
      return comparison.width.toString() === width && comparison.browser.id === browser.id;
    });

    if (!selectedComparison || selectedComparison.wasAdded) {
      return 'head';
    } else {
      return comparisonMode || 'diff';
    }
  }

  _validateBrowser(browser, build) {
    const buildBrowserIds = build.get('browsers').mapBy('id');
    const isBrowserForBuild = browser && buildBrowserIds.includes(browser.get('id'));
    if (!browser || !isBrowserForBuild) {
      const allowedBrowser = build.get('browsers.firstObject');
      this.flashMessages.danger(
        `There are no comparisons for "${
          this._params().activeBrowserFamilySlug
        }" browser. Displaying comparisons for ${allowedBrowser.get('familyName')}.`,
      );
      return allowedBrowser;
    } else {
      return browser;
    }
  }

  activate() {
    let build = this.modelFor('organization.project.builds.build');
    const props = {
      project_id: build.get('project.id'),
      project_slug: build.get('project.slug'),
      build_id: build.get('id'),
      snapshot_id: this._params().snapshot_id,
    };
    const organization = build.get('project.organization');

    this.analytics.track('Snapshot Fullscreen Viewed', organization, props);
  }

  _params() {
    return this.paramsFor(this.routeName);
  }
}
