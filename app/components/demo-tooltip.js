import Component from '@ember/component';
import {computed} from '@ember/object';
import {not, or, readOnly} from '@ember/object/computed';
import {inject as service} from '@ember/service';

/* eslint-disable max-len */
const TOOLTIP_DATA = {
  'build-overview': {
    title: 'Percy build',
    message: 'This is a Percy build. This is how we organize snapshots for visual review.',
  },
  'snapshot-overview': {
    title: 'Snapshot comparison',
    message:
      'Each comparison shows a baseline screenshot on the left and the pixels that have changed on the right. Screenshots are rendered in our infrastructure each time you make a code change.',
  },
  'comparison-overview': {
    title: 'Visual diff',
    message:
      'These red pixels highlight the visual changes underneath—we call this a "visual diff". To toggle the visual diff on or off, click it (or press "d").',
  },
  'snapshot-approval-button': {
    title: 'Approving screenshots',
    message:
      'You can review and approve the changes for each snapshot one by one, or you can approve all the snapshots at once with the “Approve All” button at the top of the page.',
  },
  'build-approval-button': {
    title: 'Approving a Percy build',
    message:
      'After all snapshots have been approved, your pull request will show the visual review has been approved',
  },
  'group-overview': {
    title: 'Automatic visual diff matching',
    message: 'Percy automatically matches and groups snapshots that have the same visual change.',
  },
  'group-approval-button': {
    title: 'Approving matching changes',
    message:
      'You can review and approve individual changes in a group one by one, or approve all grouped changes with a single click. For the whole build, all changes can be approved at once with the “Approve All” button at the top of the page.',
  },
  'snapshot-request-changes-button': {
    title: 'Requesting changes',
    message:
      'If a snapshot is not yet ready to be approved, request changes so your team can follow the status of a build.',
  },
  'group-request-changes-button': {
    title: 'Requesting changes',
    message:
      'If a snapshot is not yet ready to be approved, request changes so your team can follow the status of a build.',
  },
  'auto-approved-pill': {
    title: 'Auto-approved snapshots',
    message:
      'Percy automatically approved this snapshot because it is on the default branch -- usually `master`.',
  },
};
/* eslint-disable max-len */

export default Component.extend({
  tooltips: service(),

  tagName: '',

  key: null,
  build: null,
  anchorPlacement: null,
  isFirstInstance: true,

  title: computed('key', function() {
    if (!this.key) return;
    return TOOLTIP_DATA[this.key]['title'];
  }),
  message: computed('key', function() {
    if (!this.key) return;
    return TOOLTIP_DATA[this.key]['message'];
  }),

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

  shouldShowTooltip: computed('key', 'tooltips.currentTooltipKey', function() {
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
    this.analytics.track('Tooltip Opened', null, {tooltipInfo});
  },
});
