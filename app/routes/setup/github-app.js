import classic from 'ember-classic-decorator';
import {action} from '@ember/object';
import {inject as service} from '@ember/service';
import {alias} from '@ember/object/computed';
import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

// Remove @classic when we can refactor away from mixins
@classic
export default class GithubAppRoute extends Route.extend(AuthenticatedRouteMixin) {
  @service
  session;

  @service
  flashMessages;

  @alias('session.currentUser')
  currentUser;

  queryParams = {
    installationId: {
      as: 'installation_id',
    },
  };

  installationId = null;

  @action
  afterAppInstalled(organization) {
    organization.get('projects').then(projects => {
      if (projects.get('length') > 0) {
        this.replaceWith(
          'organizations.organization.integrations.github',
          organization.get('slug'),
        );
      } else {
        this.replaceWith('organization.index', organization.get('slug'));
      }
    });
  }

  model(params) {
    this.set('installationId', params.installationId);
  }
}
