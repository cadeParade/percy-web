import {action} from '@ember/object';
import {inject as service} from '@ember/service';
import Route from '@ember/routing/route';
import isUserMember from 'percy-web/lib/is-user-member-of-org';
import {hash} from 'rsvp';
import utils from 'percy-web/lib/utils';
import {get, set} from '@ember/object';

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

  beforeModel(transition) {
    // Data stored for `transitionToBuildPage`.
    if (transition.from) {
      set(this, '_prevRouteName', transition.from.name);
      set(this, '_prevBuildId', get(transition, 'from.parent.params.build_id'));
    }
  }

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

  // If you:
  // - came from build A AND
  // - then went to fullscreen snapshot belonging to build A AND
  // - then going back to build A AND
  // use the window.back fuction so we can preserve scroll position.
  // Otherwise, use `transitionTo` as normal.
  @action
  transitionToBuildPage(url, buildId) {
    if (
      this._prevRouteName === 'organization.project.builds.build.index' &&
      this._prevBuildId === buildId
    ) {
      utils.windowBack();
    } else {
      this.transitionTo(url);
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
