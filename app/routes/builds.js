import classic from 'ember-classic-decorator';
import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

// Remove @classic when we can refactor away from mixins
@classic
export default class BuildsRoute extends Route.extend(AuthenticatedRouteMixin) {}
