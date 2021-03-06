import Service, {inject as service} from '@ember/service';

export default class ProjectQueryService extends Service {
  @service
  store;

  getEnabledProjects(organization) {
    return this.store.query('project', {organization});
  }

  getDisabledProjects(organization) {
    return this.store.query('project', {
      organization,
      enabled: false,
    });
  }

  getAllProjects(organization) {
    return this.store.query('project', {
      organization,
      enabled: 'all',
    });
  }
}
