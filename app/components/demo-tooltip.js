import Component from '@ember/component';
import {computed} from '@ember/object';
import {not, or, readOnly} from '@ember/object/computed';
import {inject as service} from '@ember/service';

export default Component.extend({
  tooltips: service(),

  tagName: '',

  key: null,
  title: null,
  message: null,
  anchorPlacement: null,
  build: null,
  isFirstInstance: true,

  _isNotDemo: not('build.project.isDemo'),
  _isNotFirstInstance: not('isFirstInstance'),
  _isAllHidden: readOnly('tooltips.allHidden'),

  // hide anchor if not demo, not first instance, or all tooltips hidden
  shouldHideWholeTooltip: or('_isNotDemo', '_isAllHidden', '_isNotFirstInstance'),

  tooltipKey: computed(function() {
    return `percy_tooltip_hidden_${this.key}`;
  }),

  isLastTooltip: computed('tooltips.currentSequence', function() {
    // if is the last item in current presentation sequence
    if (this.tooltips.currentSequence) {
      return this.tooltips.currentSequence.lastObject === this.key;
    } else {
      return false;
    }
  }),

  shouldShowTooltip: computed('tooltips.currentTooltipKey', function() {
    // should be visible if isDemo, tooltips are not hidden, & is currentStep
    const isCurrentStep = this.tooltips.currentTooltipKey === this.key;

    // this line requires this.get because project object is a proxy here
    const isDemo = this.get('build.project.isDemo');

    return !this.shouldHideWholeTooltip && isCurrentStep && isDemo;
  }),

  init() {
    this._super(...arguments);
    this.tooltips.setCurrentBuild(this.build);
  },

  actions: {
    onChange(visible) {
      if (visible) {
        this._trackTooltipOpen();

        // set this tooltip as the current step in the flow
        this.tooltips.resetTooltipFlow(this.key, this.build);
      }
    },

    hideAllTooltips() {
      this.tooltips.hideAll();
    },

    next() {
      this.tooltips.next();
    },
  },

  _trackTooltipOpen() {
    const tooltipInfo = this.tooltipKey;
    this.get('analytics').track('Tooltip Opened', null, {tooltipInfo});
  },
});
