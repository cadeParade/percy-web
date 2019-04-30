import {create, isVisible} from 'ember-cli-page-object';
import {BillingCardUpdater} from 'percy-web/tests/pages/components/organizations/billing-card-updater'; // eslint-disable-line

export const SELECTORS = {
  CONTAINER: '[data-test-billing-section-container]',
  MEMBER_VIEW: '[data-test-member-view]',
  ADMIN_VIEW: '[data-test-admin-view]',
  USAGE_STATS: '[data-test-current-usage-stats]',
};

export const BillingSection = {
  scope: SELECTORS.CONTAINER,

  memberView: {scope: SELECTORS.MEMBER_VIEW},
  adminView: {scope: SELECTORS.ADMIN_VIEW},
  billingCardUpdater: BillingCardUpdater,
  isUsageStatsVisible: isVisible(SELECTORS.USAGE_STATS),
};

export default create(BillingSection);
