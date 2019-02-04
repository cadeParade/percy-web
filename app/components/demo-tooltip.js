import Component from '@ember/component';
import localStorageProxy from 'percy-web/lib/localstorage';
import {computed} from '@ember/object';
import {or, readOnly, not} from '@ember/object/computed';
import {inject as service} from '@ember/service';

export default Component.extend({
  tooltips: service(),

  tagName: '',

  key: null,
  title: null,
  message: null,
  anchorPlacement: null,

  _hiddenByAction: false,

  _isHidden: or('_hiddenByLocalStorage', '_hiddenByAction'),
  _isAllHidden: readOnly('tooltips.allHidden'),
  _isNotDemoProject: not('shouldShowTip'),

  shouldHideTooltip: or('_isNotDemoProject', '_isAllHidden', '_isHidden'),

  _hiddenByLocalStorage: computed(function() {
    return localStorageProxy.get(this.get('tooltipKey'));
  }),

  tooltipKey: computed(function() {
    const key = this.get('key');
    return `percy_tooltip_hidden_${key}`;
  }),

  actions: {
    onShow(visible) {
      if (visible) {
        const tooltipInfo = this.get('tooltipKey');
        this.get('analytics').track('Tooltip Opened', null, {tooltipInfo});
      }
    },

    removeTooltip(popoverHideAction) {
      popoverHideAction();

      localStorageProxy.set(this.get('tooltipKey'), true);

      this.set('_hiddenByAction', true);
    },

    hideAllTooltips(popoverHideAction) {
      popoverHideAction();
      this.get('tooltips').hideAll();
    },
  },
});
