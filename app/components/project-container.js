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

  project: null,
  showQuickstart: false,
  shouldPollForUpdates: true,

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

  builds: computed('project.id', 'isRefreshing', 'infinityBuilds._loadingMore', function() {
    const builds = this.get('store').peekAll('build');

    const filteredBuilds = builds.filter(item => {
      return item.get('project.id') === this.get('project.id');
    });

    return utils.sortAndCleanBuilds(filteredBuilds);
  }),

  selectedBranch: allBranchesString,
  projectBranches: computed('builds.@each.branch', function() {
    const allBranches = this.get('builds').mapBy('branch');
    const uniqueBranches = Array.from(new Set(allBranches));
    return [allBranchesString].concat(uniqueBranches);
  }),

  branchFilteredBuilds: computed(
    'builds.@each.branch',
    'selectedBranch',
    'projectBranches.[]',
    function() {
      if (this.get('selectedBranch') === allBranchesString) {
        return this.get('builds');
      }
      return this.get('builds').filterBy('branch', this.get('selectedBranch'));
    },
  ),

  actions: {
    chooseBranch(newBranch) {
      this.set('selectedBranch', newBranch);
    },
  },

  async _refresh() {
    this.set('isRefreshing', true);
    const project = await this.get('project').reload();
    const buildCount = this.get('buildsLimit');

    // reload the builds by querying the api with a limit, otherwise running
    // builds.reload() here hits the api without a limit and returns 100 builds
    await this.get('store').query('build', {project: project, 'page[limit]': buildCount});

    if (!this.isDestroyed) {
      this.set('isRefreshing', false);
    }
  },
});
