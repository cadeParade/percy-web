import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import {hash} from 'rsvp';
import {inject as service} from '@ember/service';

export default Route.extend(AuthenticatedRouteMixin, {
  flashMessages: service(),
  intercom: service(),
  router: service(),

  model() {
    const project = this.modelFor('organization.project');
    const browserFamilies = this.store.loadRecords('browserFamily');
    return hash({project, browserFamilies});
  },

  setupController(controller, model) {
    controller.setProperties({
      project: model.project,
      browserFamilies: model.browserFamilies.toArray(),
      badgeMarkdown: this._badgeMarkdown(model.project),
      areAnyBrowsersUpgradeable: model.project.projectBrowserTargets.any(pbt => {
        return pbt.isUpgradeable;
      }),
      isUserOrgAdmin: model.project.organization.currentUserIsAdmin,
    });
  },

  _badgeMarkdown(project) {
    // Making this string two lines messes up the formatting.
    return `[![This project is using Percy.io for visual regression testing.](https://percy.io/static/images/percy-badge.svg)](${this._badgeLinkURL(project)})`; //eslint-disable-line
  },

  _badgeLinkURL(project) {
    const origin = window.location.origin;
    return `${origin}${this.router.urlFor(
      'organization.project',
      project.get('organization'),
      project,
    )}`;
  },

  actions: {
    onCopyBadgeMarkdown() {
      this.flashMessages.success('Badge markdown was copied to your clipboard');
    },
  },
});
