import {readOnly} from '@ember/object/computed';
import {computed} from '@ember/object';
import Component from '@ember/component';
import {inject as service} from '@ember/service';
import {task} from 'ember-concurrency';

export default Component.extend({
  browserTargets: service(),
  flashMessages: service(),
  browserFamily: null,
  project: null,

  projectBrowserTargets: readOnly('project.projectBrowserTargets'),

  enabledBrowserFamilies: computed('projectBrowserTargets.@each.browserTarget.', function() {
    return this.browserTargets.enabledBrowserFamiliesForProject(this.project);
  }),

  isBrowserEnabled: computed('enabledBrowserFamilies.@each.id', 'browserFamily.id', function() {
    return this.enabledBrowserFamilies.mapBy('id').includes(this.browserFamily.id);
  }),

  projectBrowserTargetsForFamily: computed(
    'projectBrowserTargets.@each.browserFamily',
    'browserFamily.id',
    function() {
      return this.projectBrowserTargets.filter(projectBrowserTarget => {
        // this could happen when a project-browser-target is removed
        if (!projectBrowserTarget.browserTarget) return;
        return projectBrowserTarget.browserTarget.browserFamily.id === this.browserFamily.id;
      });
    },
  ),

  isBrowserUpgradeable: computed('projectBrowserTargetsForFamily.@each.isUpgradeable', function() {
    // If there are no project-browser-targets for family it is not upgradeable. (the project
    //   does not have that family enabled)
    if (this.projectBrowserTargetsForFamily.length === 0) return false;
    // If there is only one project-browser-target and it is upgradeable it will return true.
    // If there are more than one project-browser-target and any are not upgradeable, that means
    //   they already have the most recent browser for family on at least one pbt,
    //   so don't do anything.
    return this.projectBrowserTargetsForFamily.every(projectBrowserTarget => {
      return projectBrowserTarget.isUpgradeable;
    });
  }),

  _upgradeBrowser: task(function*(project, browserFamily) {
    return yield this.browserTargets.upgradeBrowserFamily(project, browserFamily);
  }),

  isUpgrading: readOnly('_upgradeBrowser.isRunning'),

  actions: {
    async upgradeBrowser() {
      if (!this.isBrowserUpgradeable) return;
      try {
        await this._upgradeBrowser.perform(this.project, this.browserFamily);
      } catch (e) {
        this.flashMessages.danger('Something went wrong. Please try again later');
      }
      this.browserTargets.callAnalytics(this.project, 'Browser Family Upgraded', {
        browser_family_slug: this.browserFamily.slug,
      });
    },
  },
});
