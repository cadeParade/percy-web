import classic from 'ember-classic-decorator';
import {computed} from '@ember/object';
import Service from '@ember/service';
import localStorageProxy from 'percy-web/lib/localstorage';
import {inject as service} from '@ember/service';
import {set} from '@ember/object';

export const TOOLTIP_MASTER_KEY = 'percy_demo_tooltips_hidden';
const GROUP_SEQUENCE = [
  'build-overview',
  'group-overview',
  'comparison-overview',
  'group-request-changes-button',
  'group-approval-button',
  'build-approval-button',
];

const NO_GROUP_SEQUENCE = [
  'build-overview',
  'snapshot-overview',
  'comparison-overview',
  'snapshot-request-changes-button',
  'snapshot-approval-button',
  'build-approval-button',
];

const NO_DIFF_SEQUENCE = [
  'build-overview',
  'snapshot-overview',
  'snapshot-approval-button',
  'build-approval-button',
];

const AUTO_APPROVED_SEQUENCE = ['build-overview', 'snapshot-overview', 'auto-approved-pill'];

// Remove @classic when we refactor `init` to constructor
@classic
export default class TooltipsService extends Service {
  @service
  router;

  @service
  snapshotQuery;

  allHidden = false;
  currentSequence = null;
  tooltipSequenceIndex = 0;
  tooltipKey = 'build-overview';

  @computed('tooltipKey')
  get currentTooltipKey() {
    return this.tooltipKey;
  }

  init() {
    super.init(...arguments);
    const isAllHidden = localStorageProxy.get(TOOLTIP_MASTER_KEY) || false;
    set(this, 'allHidden', isAllHidden);

    this.router.on('routeDidChange', () => {
      this.setToBeginning();
    });
  }

  unhideAll() {
    localStorageProxy.removeItem(TOOLTIP_MASTER_KEY);
  }

  hideAll() {
    localStorageProxy.set(TOOLTIP_MASTER_KEY, true);
    set(this, 'allHidden', true);
  }

  setCurrentBuild(build) {
    set(this, 'build', build);
  }

  setToBeginning() {
    set(this, 'currentSequence', this._getCurrentSequence(this.build));
    set(this, 'tooltipSequenceIndex', 0);
    set(this, 'tooltipKey', 'build-overview');
  }

  async resetTooltipFlow(currentKey, build) {
    // pick the correct scenario array for current scenario
    const scenario = await this._getCurrentSequence(build);
    set(this, 'currentSequence', scenario);
    // get index of currentKey
    const index = scenario.indexOf(currentKey);
    // set tooltipSequenceIndex to index of currentKey
    set(this, 'tooltipSequenceIndex', index);
    // set tooltipKey to updated tooltip
    set(this, 'tooltipKey', scenario[index]);
  }

  async next() {
    // pick the correct scenario array for current scenario
    const scenario = this.currentSequence;
    // move to next tooltip by incrementing tooltipSequenceIndex by 1
    const nextTooltip = scenario[this.tooltipSequenceIndex + 1];
    set(this, 'tooltipKey', nextTooltip);
  }

  async _getCurrentSequence(build) {
    // assume redirecting to demo project build 2 with groups when no build is present
    if (!build || !build.get('sortMetadata')) {
      return GROUP_SEQUENCE;
    }

    // if build.baseBuild = null then this is the first build and has no comparisons
    // need to use `get` syntax for this because `build` in this case is actually a proxy object.
    if (build.get('project.defaultBaseBranch') === build.get('branch')) {
      return AUTO_APPROVED_SEQUENCE;
    } else if (!build.get('baseBuild')) {
      return NO_DIFF_SEQUENCE;
    } else if (build.get('sortMetadata').areAnyGroups) {
      return GROUP_SEQUENCE;
    } else {
      return NO_GROUP_SEQUENCE;
    }
  }
}
