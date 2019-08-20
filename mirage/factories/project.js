import {Factory, trait} from 'ember-cli-mirage';
import moment from 'moment';

export default Factory.extend({
  isEnabled: true,
  isDemo: false,
  name(i) {
    return `The Project That We All Adore And Love Working On ${i}`;
  },
  slug() {
    return this.name.underscore();
  },
  fullSlug() {
    return `${this.organization.slug}/${this.slug}`;
  },
  updatedAt() {
    return moment();
  },

  afterCreate(project, server) {
    server.create('token', {project});
  },

  isDisabled: trait({isEnabled: false}),

  demo: trait({isDemo: true}),

  publiclyReadable: trait({publiclyReadable: true}),

  defaultBaseBranch() {
    return 'master';
  },

  withChrome: trait({
    afterCreate(project, server) {
      const chromeBrowserTarget = server.create('browserTarget', 'withChromeBrowserFamily');
      server.create('projectBrowserTarget', {
        project: project,
        browserTarget: chromeBrowserTarget,
      });
    },
  }),

  withFirefox: trait({
    afterCreate(project, server) {
      const firefoxBrowserTarget = server.create('browserTarget', 'withFirefoxBrowserFamily');
      server.create('projectBrowserTarget', {
        project: project,
        browserTarget: firefoxBrowserTarget,
      });
    },
  }),

  withChromeAndFirefox: trait({
    afterCreate(project, server) {
      const firefoxBrowserTarget = server.create('browserTarget', 'withFirefoxBrowserFamily');
      const chromeBrowserTarget = server.create('browserTarget', 'withChromeBrowserFamily');
      server.create('projectBrowserTarget', {
        project: project,
        browserTarget: firefoxBrowserTarget,
      });
      server.create('projectBrowserTarget', {
        project: project,
        browserTarget: chromeBrowserTarget,
      });
    },
  }),
});
