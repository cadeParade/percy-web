import Component from '@ember/component';
import PollingMixin from 'percy-web/mixins/polling';
import utils from 'percy-web/lib/utils';
import {computed} from '@ember/object';
import {and, equal, gt, not} from '@ember/object/computed';
import {inject as service} from '@ember/service';

import {INFINITY_SCROLL_LIMIT} from 'percy-web/models/build';

const allBranchesString = 'All branches';

export default Component.extend(PollingMixin, {
  store: service(),
  'data-test-project-container': true,

  project: null,
  showQuickstart: false,
  shouldPollForUpdates: true,
  showUnixBash: true,

  POLLING_INTERVAL_SECONDS: 10,

  buildsLimit: INFINITY_SCROLL_LIMIT,

  canLoadMore: computed.not('infinityBuilds.reachedInfinity'),
  shouldLoadMore: and('isAllBranchesSelected', 'canLoadMore'),

  // branches list also includes 'All branches'
  shouldShowBranchFilter: gt('projectBranches.length', 2),
  isAllBranchesSelected: equal('selectedBranch', allBranchesString),
  isBranchSelected: not('isAllBranchesSelected'),

  pollRefresh() {
    return this._refresh();
  },

  builds: computed('project.id', 'isRefreshing', 'infinityBuilds.loadingMore', function() {
    const builds = this.store.peekAll('build');

    const filteredBuilds = builds.filter(item => {
      return item.get('project.id') === this.get('project.id');
    });

    return utils.sortAndCleanBuilds(filteredBuilds);
  }),

  selectedBranch: allBranchesString,
  projectBranches: computed('builds.@each.branch', function() {
    const allBranches = this.builds.mapBy('branch');
    const uniqueBranches = Array.from(new Set(allBranches));
    return [allBranchesString].concat(uniqueBranches);
  }),

  branchFilteredBuilds: computed(
    'builds.@each.branch',
    'selectedBranch',
    'projectBranches.[]',
    function() {
      if (this.selectedBranch === allBranchesString) {
        return this.builds;
      }
      return this.builds.filterBy('branch', this.selectedBranch);
    },
  ),

  actions: {
    chooseBranch(newBranch) {
      this.set('selectedBranch', newBranch);
    },

    switchBashSyntax() {
      this.toggleProperty('showUnixBash');
    },
  },

  async _refresh() {
    this.set('isRefreshing', true);
    const project = await this.project.reload();
    const buildCount = this.buildsLimit;

    // reload the builds by querying the api with a limit, otherwise running
    // builds.reload() here hits the api without a limit and returns 100 builds
    await this.store.query('build', {project: project, 'page[limit]': buildCount});

    if (!this.isDestroyed) {
      this.set('isRefreshing', false);
    }
  },
});
