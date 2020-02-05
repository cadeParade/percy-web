import Service, {inject as service} from '@ember/service';

export default class RepoRefreshService extends Service {
  @service
  store;

  getFreshRepos(organization) {
    return organization.reload().then(organization => {
      return organization.get('repos').reload();
    });
  }
}
