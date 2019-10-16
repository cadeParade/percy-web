import Route from '@ember/routing/route';

export default Route.extend({
  queryParams: {
    connectionName: {},
    organizationName: {},
    provider: {},
    required: {},
  },
});
