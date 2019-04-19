import Service, {inject as service} from '@ember/service';

export default Service.extend({
  store: service(),
  getEnabledProjects(organization) {
    return this.store.query('project', {organization});
  },

  getDisabledProjects(organization) {
    return this.store.query('project', {
      organization,
      enabled: false,
    });
  },

  getAllProjects(organization) {
    return this.store.query('project', {
      organization,
      enabled: 'all',
    });
  },
});
