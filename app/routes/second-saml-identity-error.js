import Route from '@ember/routing/route';

export default class SecondSamlIdentityErrorRoute extends Route {
  queryParams = {
    connectionName: {},
    newSsoProfileEmail: {},
    organizationName: {},
    provider: {},
    userEmail: {},
  };
}
