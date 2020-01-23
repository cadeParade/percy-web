import Route from '@ember/routing/route';
import ResetScrollMixin from 'percy-web/mixins/reset-scroll';
import {inject as service} from '@ember/service';
import isUserMember from 'percy-web/lib/is-user-member-of-org';
import {hash} from 'rsvp';

export default Route.extend(ResetScrollMixin, {
  snapshotQuery: service(),
  store: service(),
  flashMessages: service(),
  session: service(),
  params: null,
  queryParams: {
    comparisonMode: {as: 'mode'},
    activeBrowserFamilySlug: {as: 'browser', refreshModel: true},
    currentWidth: {as: 'width'},
  },
  model(params /*transition*/) {
    this.set('params', params);
    const organization = this.modelFor('organization');
    return hash({
      snapshot: this.snapshotQuery.getSnapshot(params.snapshot_id),
      isUserMember: isUserMember(this.session.currentUser, organization),
    });
  },

  setupController(controller, model) {
    const params = this.params;
    const build = this.modelFor('organization.project.builds.build2').build;
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
      const validatedWidth = this._validatedWidth(model.snapshot, params.currentWidth);

      controller.setProperties({
        build,
        activeBrowser,
        snapshot: model.snapshot,
        isBuildApprovable: model.isUserMember,
        snapshotId: params.snapshot_id,
        snapshotSelectedWidth: validatedWidth,
        comparisonMode: validatedComparisonMode,
      });
    }
  },

  _validatedWidth(snapshot, currentWidth) {
    const comparisons = snapshot.comparisons;
    const selectedComparison = comparisons.find(comparison => {
      return comparison.width.toString() === currentWidth;
    });
    return selectedComparison ? selectedComparison.width : comparisons.firstObject.width.toString();
  },

  _validateComparisonMode(comparisonMode, snapshot, width, browser) {
    const selectedComparison = snapshot.comparisons.find(comparison => {
      return comparison.width.toString() === width && comparison.browser.id === browser.id;
    });

    if (!selectedComparison || selectedComparison.wasAdded) {
      return 'head';
    } else {
      return comparisonMode || 'diff';
    }
  },

  _validateBrowser(browser, build) {
    const buildBrowserIds = build.get('browsers').mapBy('id');
    const isBrowserForBuild = browser && buildBrowserIds.includes(browser.get('id'));
    if (!browser || !isBrowserForBuild) {
      const allowedBrowser = build.get('browsers.firstObject');
      this._updateActiveBrowser(allowedBrowser);
    } else {
      return browser;
    }
  },

  _updateActiveBrowser(newBrowser) {
    this.controllerFor(this.routeName).set('activeBrowser', newBrowser);
    this._updateQueryParams({newBrowserSlug: newBrowser.get('familySlug')});
  },

  activate() {
    this._track('Snapshot Fullscreen Viewed');
  },

  _track(actionName, extraProps) {
    let build = this.modelFor('organization.project.builds.build2').build;
    const genericProps = {
      project_id: build.get('project.id'),
      project_slug: build.get('project.slug'),
      build_id: build.get('id'),
      snapshot_id: this.params.snapshot_id,
    };
    const organization = build.get('project.organization');

    const props = Object.assign({}, extraProps, genericProps);
    this.analytics.track(actionName, organization, props);
  },

  actions: {
    noop() {},
    updateComparisonMode(mode) {
      this._updateQueryParams({comparisonMode: mode});
      this._track('Fullscreen: Comparison Mode Switched', {mode});
    },
    updateActiveBrowser(newBrowser) {
      this._updateActiveBrowser(newBrowser);
      this._track('Fullscreen: Browser Switched', {
        browser_id: newBrowser.get('id'),
        browser_family_slug: newBrowser.get('browserFamily.slug'),
      });
    },
    transitionRouteToWidth(width) {
      this._updateQueryParams({newWidth: width});
      this._track('Fullscreen: Width Switched', {width});
    },
  },

  _updateQueryParams(params) {
    const controller = this.controllerFor(this.routeName);
    const snapshot = this.modelFor(this.routeName).snapshot;
    const comparisonMode = params.comparisonMode || controller.comparisonMode;
    const browser = params.newBrowserSlug || controller.get('activeBrowser.familySlug');
    const width = params.newWidth || controller.snapshotSelectedWidth || this.params.width;

    this.transitionTo(
      'organization.project.builds.build2.snapshot',
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
  },
});
