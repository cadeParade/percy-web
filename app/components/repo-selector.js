import Component from '@ember/component';
import PollingMixin from 'percy-web/mixins/polling';
import {computed} from '@ember/object';
import {readOnly, or} from '@ember/object/computed';
import {inject as service} from '@ember/service';
import moment from 'moment';

export default Component.extend(PollingMixin, {
  repoRefresh: service(),

  classNameBindings: ['classes'],
  attributeBindings: ['data-test-repo-selector'],
  'data-test-repo-selector': true,

  MAX_UPDATE_POLLING_REQUESTS: 10,

  project: null,
  isSaving: null,
  isSaveSuccessful: null,
  isRepoRefreshInProgress: false,

  selectedRepo: readOnly('project.repo'),
  organization: readOnly('project.organization'),

  groupedRepos: readOnly('organization.groupedRepos'),
  lastSyncedAt: readOnly('organization.lastSyncedAt'),
  isSyncing: readOnly('organization.isSyncing'),

  shouldPollForUpdates: or('isRepoDataStale', 'isSyncing'),

  isRepoDataStale: computed('lastSyncedAt', 'isSyncing', 'isRepoRefreshInProgress', function () {
    if (!this.get('organization.isVersionControlIntegrated')) {
      return false;
    }

    const isSyncing = this.isSyncing;
    const lastSyncedAt = this.lastSyncedAt;
    if (!lastSyncedAt || isSyncing) {
      return true;
    } else {
      return moment(lastSyncedAt).isBefore(10, 'minutes');
    }
  }),

  pollRefresh() {
    this.triggerRepoRefresh();
  },

  triggerRepoRefresh() {
    let self = this;
    let organization = this.organization;
    this.set('isRepoRefreshInProgress', true);
    this.repoRefresh.getFreshRepos(organization).finally(() => {
      self.set('isRepoRefreshInProgress', false);
    });
  },

  triggerSavingIndicator(promise) {
    this.set('isSaveSuccessful', null);
    this.set('isSaving', true);
    promise.then(
      () => {
        this.set('isSaving', false);
        this.set('isSaveSuccessful', true);
      },
      () => {
        this.set('isSaveSuccessful', false);
      },
    );
  },

  actions: {
    chooseRepo(repo) {
      let project = this.project;
      project.set('repo', repo);

      // If the project is not saved (ie. we're on the new project screen), don't trigger saving,
      // just set the property above and it will be saved when the user creates the project.
      if (!project.get('isNew')) {
        this.triggerSavingIndicator(project.save());
      }
    },
    refreshRepos() {
      this.triggerRepoRefresh();
    },
  },
});
