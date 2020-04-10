import Controller from '@ember/controller';
import {inject as service} from '@ember/service';
import {computed} from '@ember/object';
import {readOnly} from '@ember/object/computed';

export default class OrganizationsController extends Controller {
  @service
  router;

  @readOnly('router.currentRouteName')
  currentRouteName;

  @computed('currentRouteName')
  get shouldShowNav() {
    return !this.currentRouteName.includes('new');
  }
}
