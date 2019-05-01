import Service from '@ember/service';
import localStorageProxy from 'percy-web/lib/localstorage';
import groupSnapshots from 'percy-web/lib/group-snapshots';
import {computed} from '@ember/object';
import {inject as service} from '@ember/service';

export const TOOLTIP_MASTER_KEY = 'percy_demo_tooltips_hidden';

const GROUP_SEQUENCE = ['one', 'seven', 'three', 'eight', 'five'];
const NO_GROUP_SEQUENCE = ['one', 'two', 'three', 'four', 'five'];
const NO_DIFF_SEQUENCE = ['one', 'two', 'four', 'five'];

export default Service.extend({
  router: service(),

  allHidden: false,

  currentSequence: null,
  tooltipSequenceIndex: 0,
  tooltipKey: 'one',

  currentTooltipKey: computed('tooltipKey', function() {
    return this.tooltipKey;
  }),

  init() {
    this._super(...arguments);
    const isAllHidden = localStorageProxy.get(TOOLTIP_MASTER_KEY) || false;
    this.set('allHidden', isAllHidden);

    this.router.on('routeDidChange', () => {
      this.setToBeginning();
    });
  },

  unhideAll() {
    localStorageProxy.removeItem(TOOLTIP_MASTER_KEY);
  },

  hideAll() {
    localStorageProxy.set(TOOLTIP_MASTER_KEY, true);
    this.set('allHidden', true);
  },

  setCurrentBuild(build) {
    this.set('build', build);
  },

  setToBeginning() {
    this.set('currentSequence', this._getCurrentSequence(this.build));
    this.set('tooltipSequenceIndex', 0);
    this.set('tooltipKey', 'one');
  },

  async resetTooltipFlow(currentKey, build) {
    // pick the correct scenario array for current scenario
    const scenario = await this._getCurrentSequence(build);
    this.set('currentSequence', scenario);
    // get index of currentKey
    const index = scenario.indexOf(currentKey);
    // set tooltipSequenceIndex to index of currentKey
    this.set('tooltipSequenceIndex', index);
    // set tooltipKey to updated tooltip
    this.set('tooltipKey', scenario[index]);
  },

  async next() {
    // pick the correct scenario array for current scenario
    const scenario = this.currentSequence;
    // move to next tooltip by incrementing tooltipSequenceIndex by 1
    const nextTooltip = scenario[this.tooltipSequenceIndex + 1];
    this.set('tooltipKey', nextTooltip);
  },

  async _getCurrentSequence(build) {
    // assume redirecting to demo project build 2 with groups when no build is present
    if (!build) {
      return GROUP_SEQUENCE;
    }

    const snapshots = await build.get('snapshots');

    // only need to know if there is a group, don't need them to be in order
    const groupedSnapshots = groupSnapshots(snapshots);

    // if build.baseBuild = null then this is the first build and has no comparisons
    if (!build.baseBuild) {
      return NO_DIFF_SEQUENCE;
    } else if (groupedSnapshots.groups.length > 0) {
      return GROUP_SEQUENCE;
    } else {
      return NO_GROUP_SEQUENCE;
    }
  },
});
