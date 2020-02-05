import Route from '@ember/routing/route';

export default class AboutRoute extends Route {
  beforeModel() {
    this.replaceWith('team');
  }
}
