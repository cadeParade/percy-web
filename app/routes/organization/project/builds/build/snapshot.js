import Route from '@ember/routing/route';
import ResetScrollMixin from 'percy-web/mixins/reset-scroll';
import {inject as service} from '@ember/service';
import isUserMemberPromise from 'percy-web/lib/is-user-member-of-org';
import {hash} from 'rsvp';

export default Route.extend(ResetScrollMixin, {
  store: service(),
  flashMessages: service(),
  params: {},
  queryParams: {
    comparisonMode: {as: 'mode'},
    activeBrowserFamilySlug: {as: 'browser', refreshModel: true},
  },
  model(params /*transition*/) {
    this.set('params', params);
    const organization = this.modelFor('organization');
    return hash({
      snapshot: this.store.findRecord('snapshot', params.snapshot_id),
      isUserMember: isUserMemberPromise(organization),
    });
  },

  setupController(controller, model) {
    this._super(...arguments);
    const params = this.get('params');
    const build = this.modelFor('organization.project.builds.build').build;
    const activeBrowser = this.get('store')
      .peekAll('browser')
      .findBy('familySlug', params.activeBrowserFamilySlug);

    const validatedBrowser = this._validateBrowser(activeBrowser, build);

    if (validatedBrowser) {
      controller.setProperties({
        build,
        activeBrowser,
        isBuildApprovable: model.isUserMember,
        snapshotId: params.snapshot_id,
        snapshotSelectedWidth: params.width,
        comparisonMode: params.comparisonMode,
      });
    }
  },

  _validateBrowser(browser, build) {
    const buildBrowserIds = build.get('browsers').mapBy('id');
    const isBrowserForBuild = browser && buildBrowserIds.includes(browser.get('id'));
    if (!browser || !isBrowserForBuild) {
      const allowedBrowser = build.get('browsers.firstObject');
      this._updateActiveBrowser(allowedBrowser);
      this.get('flashMessages').danger(
        `There are no comparisons for "${
          this.get('params').activeBrowserFamilySlug
        }" browser. Displaying comparisons for ${allowedBrowser.get('familyName')}.`,
      );
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
    let build = this.modelFor('organization.project.builds.build').build;
    const genericProps = {
      project_id: build.get('project.id'),
      project_slug: build.get('project.slug'),
      build_id: build.get('id'),
      snapshot_id: this.get('params').snapshot_id,
    };
    const organization = build.get('project.organization');

    const props = Object.assign({}, extraProps, genericProps);
    this.analytics.track(actionName, organization, props);
  },

  actions: {
    didTransition() {
      this._super(...arguments);
      this.send('updateIsHidingBuildContainer', true);
    },
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

    // This is how navigating through snapshots is determined in full screen snapshot mode.
    // It defaults to navigating through changed snapshots (allChangedBrowserSnapshotsSorted), as
    // it does in the build screen view. If unchanged snapshots are not loaded,
    // it will loop through all of the changed snapshots.
    // If unchanged snapshots are loaded, `unchangedSnapshots` property will be populated via
    // `notifyOfUnchangedSnapshots` in `build-container.js`. When this happens, the unchanged
    // snapshots will be added to the array of snapshots and a user will be able to navigate through
    // all snapshots in the build.
    // The reason it is done this way is because loading unchanged snapshots happens in
    // build-container component, and so this route has no knowledge of it. To work around this
    // without a large refactor, we let this route know when there are unchanged snapshots whenever
    // a user asks for them.
    // Two edge cases that are also handled (in `_updateSnapshotId`) are:
    // 1) When a user loads an unchanged full screen snapshot directly, no other unchanged snapshots
    //    will be loaded. In this case, it allows keyboard nav but after a user navigates away from
    //    the unchanged snapshot, they will be cycling through the changed snapshots.
    // 2) When a user loads an unchanged full screen snapshot directly and there are NO changed
    //    snapshots in the build, if a user tries to navigate to prev/next snapshot, it will display
    //    a flash message to close the fullscreen view.
    updateSnapshotId({isNext = true} = {}) {
      const buildController = this.controllerFor('organization.project.builds.build');
      const snapshotController = this.controllerFor(this.routeName);
      const activeBrowser = snapshotController.get('activeBrowser');
      const unchangedSnapshots = buildController.get('_unchangedSnapshots');
      const snapshotsForBrowser = buildController.get('allChangedBrowserSnapshotsSorted')[
        activeBrowser.get('id')
      ];

      const allVisibleSnapshots = [].concat(snapshotsForBrowser, unchangedSnapshots);

      const activeSnapshotBlockId = snapshotController.get('snapshotId');

      const newSnapshotId = this._updateSnapshotId(
        allVisibleSnapshots,
        activeSnapshotBlockId,
        isNext,
      );

      if (newSnapshotId) {
        this.transitionTo(
          'organization.project.builds.build.snapshot',
          newSnapshotId,
          snapshotController.get('snapshotSelectedWidth'),
          {
            queryParams: {
              mode: snapshotController.get('comparisonMode'),
              activeBrowserFamilySlug: activeBrowser.get('familySlug'),
            },
          },
        );
      }
    },
  },

  _updateQueryParams(params) {
    const controller = this.controllerFor(this.routeName);
    const snapshot = this.modelFor(this.routeName).snapshot;
    const comparisonMode = params.comparisonMode || controller.get('comparisonMode');
    const browser = params.newBrowserSlug || controller.get('activeBrowser.familySlug');
    const width = params.newWidth || controller.get('snapshotSelectedWidth') || this.params.width;

    this.transitionTo(
      'organization.project.builds.build.snapshot',
      snapshot.get('build.id'),
      snapshot.get('id'),
      width,
      {
        queryParams: {
          mode: comparisonMode,
          activeBrowserFamilySlug: browser,
        },
      },
    );
  },

  _updateSnapshotId(snapshots, snapshotId, isNext) {
    // This would happen when both (a) A user navigates directly to fullscreen view (via url) of an
    // unchanged snapshot AND (b) the build has NO changed snapshots.
    if (snapshots.length === 0) {
      this.get('flashMessages').info(
        "There's no other snapshots to navigate through." +
          'Try closing this screen (top right corner) and viewing the full build.',
      );
      return;
    }

    const currentSnapshotIndex = snapshots.mapBy('id').indexOf(snapshotId);
    let nextSnapshotIndex = isNext ? currentSnapshotIndex + 1 : currentSnapshotIndex - 1;

    // A user has navigated past the last snapshot
    if (nextSnapshotIndex > snapshots.length - 1 && isNext) {
      nextSnapshotIndex = 0;
      this.get('flashMessages').info("You're now at the beginning.");
      // A user has navigated to before the last snapshot
    } else if (nextSnapshotIndex < 0 && !isNext) {
      nextSnapshotIndex = snapshots.length - 1;
      this.get('flashMessages').info("You're now at the end.");
    }

    const nextSnapshot = snapshots[nextSnapshotIndex];
    if (nextSnapshot) {
      return nextSnapshot.get('id');
    }
  },
});
