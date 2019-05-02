import {create} from 'ember-cli-page-object';
import {BillingCardUpdater} from 'percy-web/tests/pages/components/organizations/billing-card-updater'; // eslint-disable-line
import {currentPlan} from 'percy-web/tests/pages/components/organizations/current-plan'; // eslint-disable-line

export const SELECTORS = {
  CONTAINER: '[data-test-billing-section-container]',
  MEMBER_VIEW: '[data-test-member-view]',
  ADMIN_VIEW: '[data-test-admin-view]',
};

export const BillingSection = {
  scope: SELECTORS.CONTAINER,

  memberView: {scope: SELECTORS.MEMBER_VIEW},
  adminView: {scope: SELECTORS.ADMIN_VIEW},
  billingCardUpdater: BillingCardUpdater,
  currentPlan,
};

export default create(BillingSection);
