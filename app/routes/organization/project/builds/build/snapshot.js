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

  params = null;

  queryParams = {
    currentWidth: {as: 'width'},
    comparisonMode: {as: 'mode'},
    activeBrowserFamilySlug: {as: 'browser', refreshModel: true},
  };

  beforeModel(transition) {
    if (transition.from) {
      set(this, '_prevRouteName', transition.from.name);
      set(this, '_prevBuildId', get(transition, 'from.parent.params.build_id'));
    }
  }

  model(params) {
    set(this, 'params', params);
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
    const params = this.params;
    const build = this.modelFor('organization.project.builds.build');
    const activeBrowser = this.store
      .peekAll('browser')
      .findBy('familySlug', params.activeBrowserFamilySlug);

    const validatedBrowser = this._validateBrowser(activeBrowser, build);

    if (validatedBrowser) {
      const validatedComparisonMode = this._validateComparisonMode(
        params.comparisonMode,
        model.snapshot,
        params.currentWidth,
        validatedBrowser,
      );

      controller.setProperties({
        build,
        activeBrowser,
        isBuildApprovable: model.isUserMember,
        snapshotId: params.snapshot_id,
        snapshotSelectedWidth: params.currentWidth,
        comparisonMode: validatedComparisonMode,
      });
    }
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
      this._updateActiveBrowser(allowedBrowser);
      this.flashMessages.danger(
        `There are no comparisons for "${
          this.params.activeBrowserFamilySlug
        }" browser. Displaying comparisons for ${allowedBrowser.get('familyName')}.`,
      );
    } else {
      return browser;
    }
  }

  _updateActiveBrowser(newBrowser) {
    this.controllerFor(this.routeName).set('activeBrowser', newBrowser);
    this._updateQueryParams({newBrowserSlug: newBrowser.get('familySlug')});
  }

  activate() {
    this._track('Snapshot Fullscreen Viewed');
  }

  _track(actionName, extraProps) {
    let build = this.modelFor('organization.project.builds.build');
    const genericProps = {
      project_id: build.get('project.id'),
      project_slug: build.get('project.slug'),
      build_id: build.get('id'),
      snapshot_id: this.params.snapshot_id,
    };
    const organization = build.get('project.organization');

    const props = Object.assign({}, extraProps, genericProps);
    this.analytics.track(actionName, organization, props);
  }

  @action
  updateComparisonMode(mode) {
    this._updateQueryParams({comparisonMode: mode});
    this._track('Fullscreen: Comparison Mode Switched', {mode});
  }

  @action
  updateActiveBrowser(newBrowser) {
    this._updateActiveBrowser(newBrowser);
    this._track('Fullscreen: Browser Switched', {
      browser_id: newBrowser.get('id'),
      browser_family_slug: newBrowser.get('browserFamily.slug'),
    });
  }

  @action
  transitionRouteToWidth(width) {
    this._updateQueryParams({newWidth: width});
    this._track('Fullscreen: Width Switched', {width});
  }

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

  _updateQueryParams(params) {
    const controller = this.controllerFor(this.routeName);
    const snapshot = this.modelFor(this.routeName).snapshot;
    const comparisonMode = params.comparisonMode || controller.comparisonMode;
    const browser = params.newBrowserSlug || controller.get('activeBrowser.familySlug');
    const width = params.newWidth || controller.snapshotSelectedWidth || this.params.width;

    this.transitionTo(
      'organization.project.builds.build.snapshot',
      snapshot.get('build.id'),
      snapshot.get('id'),
      {
        queryParams: {
          currentWidth: width,
          mode: comparisonMode,
          activeBrowserFamilySlug: browser,
        },
      },
    );
  }
}
