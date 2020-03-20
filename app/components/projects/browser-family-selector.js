import {readOnly} from '@ember/object/computed';
import {computed} from '@ember/object';
import {inject as service} from '@ember/service';
import Component from '@ember/component';

export default Component.extend({
  flashMessages: service(),
  browserTargets: service(),
  project: null,
  allBrowserFamilies: null,

  sortedAllBrowserFamilies: computed('allBrowserFamilies.@each.slug', function() {
    const chromeFamily = this.allBrowserFamilies.findBy('slug', 'chrome');
    const notChromeFamilies = this.allBrowserFamilies.rejectBy('slug', 'chrome');
    if (chromeFamily) {
      return [chromeFamily].concat(notChromeFamilies);
    } else {
      return notChromeFamilies;
    }
  }),

  projectBrowserTargets: readOnly('project.projectBrowserTargets'),

  enabledBrowserFamilies: computed('projectBrowserTargets.@each.browserTarget', function() {
    return this.browserTargets.enabledBrowserFamiliesForProject(this.project);
  }),

  updatePeriods: computed('projectBrowserTargets.@each.browserTarget', function() {
    return this.projectBrowserTargets
      .filter(projectBrowserTarget => {
        return projectBrowserTarget.browserTarget.isDeprecated;
      })
      .map(projectBrowserTarget => {
        const target = projectBrowserTarget.browserTarget;

        return {
          familyName: target.browserFamily.name,
          start: target.deprecationPeriodStart,
          end: target.deprecationPeriodEnd,
        };
      });
  }),

  actions: {
    updateProjectBrowserTargets(targetFamily) {
      if (this.project.isDemo) {
        return;
      }

      const projectHasBrowserFamily = this.enabledBrowserFamilies
        .mapBy('id')
        .includes(targetFamily.id);
      if (projectHasBrowserFamily) {
        if (this.enabledBrowserFamilies.length === 1) {
          this.flashMessages.info('A project must have at least one browser');
          return;
        }

        this.browserTargets
          .removeProjectBrowserTargetForFamily(targetFamily, this.project)
          .then(() => this._onRemoveSuccess(targetFamily))
          .catch(e => this._onRemoveFail(e))
          .finally(() => {
            this.browserTargets.callAnalytics(this.project, 'Browser Family Removed', {
              browser_family_slug: targetFamily.slug,
            });
          });
      } else {
        this.browserTargets
          .addProjectBrowserTargetForFamily(targetFamily, this.project)
          .then(() => this._onAddSuccess(targetFamily))
          .catch(() => this._genericFailMessage())
          .finally(() => {
            this.browserTargets.callAnalytics(this.project, 'Browser Family Added', {
              browser_family_slug: targetFamily.slug,
            });
          });
      }
    },
  },

  _onRemoveSuccess(browserFamily) {
    this.flashMessages.success(
      `All builds for this project going forward will not be run with ${browserFamily.name}.`,
      {title: 'Browser Disabled.'},
    );
  },

  _onRemoveFail(e) {
    const errors = e.errors;
    if (Array.isArray(errors)) {
      this.flashMessages.danger(this._errorsWithDetails(errors).mapBy('detail'));
    } else {
      this.flashMessages.danger('Something went wrong. Please try again later');
    }
  },

  _onAddSuccess(browserFamily) {
    this.flashMessages.success(
      `Great! All builds for this project going forward will be run with ${browserFamily.name}.`,
    );
  },

  _genericFailMessage() {
    this.flashMessages.danger('Something went wrong. Please try again later');
  },

  _errorsWithDetails(errors) {
    return errors.filter(error => {
      return !!error.detail;
    });
  },
});
