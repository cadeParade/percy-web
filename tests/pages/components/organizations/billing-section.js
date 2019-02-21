import {create} from 'ember-cli-page-object';

export const SELECTORS = {
  CONTAINER: '[data-test-billing-section-container]',
  MEMBER_VIEW: '[data-test-member-view]',
  ADMIN_VIEW: '[data-test-admin-view]',
};

export const BillingSection = {
  scope: SELECTORS.CONTAINER,

  memberView: {scope: SELECTORS.MEMBER_VIEW},
  adminView: {scope: SELECTORS.ADMIN_VIEW},
};

export default create(BillingSection);
