import Service from '@ember/service';
import localStorageProxy from 'percy-web/lib/localstorage';

export const TOOLTIP_MASTER_KEY = 'percy_tooltip_hidden_master';

export default Service.extend({
  allHidden: false,

  init() {
    const isAllHidden = localStorageProxy.get(TOOLTIP_MASTER_KEY) || false;
    this.set('allHidden', isAllHidden);
  },

  hideAll() {
    localStorageProxy.set(TOOLTIP_MASTER_KEY, true);
    this.set('allHidden', true);
  },

  triggerRerender() {
    this.notifyPropertyChange('allHidden');
  },
});
