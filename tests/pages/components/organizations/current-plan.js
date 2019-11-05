import {clickable, create, isVisible} from 'ember-cli-page-object';

const SELECTORS = {
  SCOPE: '[data-test-current-plan]',
  SNAPSHOTS_INCLUDED: '[data-test-snapshots-included]',
  USER_LIMIT: '[data-test-user-limit]',
  MONTHLY_COST: '[data-test-monthly-cost]',
  OVERAGES: '[data-test-overages]',
  USAGE_STATS: '[data-test-current-usage-stats]',
  TRIAL_BLURB: '[data-test-trial-blurb]',
  FREE_BLURB: '[data-test-free-blurb]',
  DEPRECATED_BLURB: '[data-test-deprecated-blurb]',
  CONTACT_BLURB: '[data-test-contact-us-blurb]',
  FREE_PLAN_SUPPORT: '[data-test-free-plan-support]',
  PLAN_SUPPORT: '[data-test-plan-support]',
};

export const currentPlan = {
  scope: SELECTORS.SCOPE,
  isSnapshotsIncludedVisible: isVisible(SELECTORS.SNAPSHOTS_INCLUDED),
  isUserLimitVisible: isVisible(SELECTORS.USER_LIMIT),
  isMonthlyCostVisible: isVisible(SELECTORS.MONTHLY_COST),
  isOveragesVisible: isVisible(SELECTORS.OVERAGES),
  isUsageStatsVisible: isVisible(SELECTORS.USAGE_STATS),
  isTrialBlurbVisible: isVisible(SELECTORS.TRIAL_BLURB),
  isFreeBlurbVisible: isVisible(SELECTORS.FREE_BLURB),
  isDeprecatedBlurbVisible: isVisible(SELECTORS.DEPRECATED_BLURB),
  isContactBlurbVisible: isVisible(SELECTORS.CONTACT_BLURB),
  clickFreePlanSupport: clickable(SELECTORS.FREE_PLAN_SUPPORT),
  clickPlanSupport: clickable(SELECTORS.PLAN_SUPPORT),
};

export default create(currentPlan);
