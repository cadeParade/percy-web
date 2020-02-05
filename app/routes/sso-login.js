import Route from '@ember/routing/route';

export default class SsoLoginRoute extends Route {
  queryParams = {
    connectionName: {},
    organizationName: {},
    provider: {},
    required: {},
  };
}
