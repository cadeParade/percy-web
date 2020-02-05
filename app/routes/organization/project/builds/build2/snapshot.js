import Route from '@ember/routing/route';
import {inject as service} from '@ember/service';
import isUserMember from 'percy-web/lib/is-user-member-of-org';
import {hash} from 'rsvp';
import {SNAPSHOT_COMPARISON_INCLUDES} from 'percy-web/services/snapshot-query';

export default Route.extend({
  snapshotQuery: service(),
  store: service(),
  flashMessages: service(),
  session: service(),
  params: null,

  model(params /*transition*/) {
    this.set('params', params);
    const organization = this.modelFor('organization');
    const snapshot = this.store.loadRecord('snapshot', params.snapshot_id, {
      include: SNAPSHOT_COMPARISON_INCLUDES.join(','),
      backgroundReload: false,
    });
    return hash({
      snapshot,
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
        activeBrowser: validatedBrowser,
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
      return allowedBrowser;
    } else {
      return browser;
    }
  },

  actions: {
    willTransition(transition) {
      this.controllerFor('organization.project.builds.build2').send(
        'loadNextSnapshots',
        transition.from.params.snapshot_id,
      );
    },
    noop() {},
  },
});
