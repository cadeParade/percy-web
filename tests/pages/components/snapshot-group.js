import {create, text} from 'ember-cli-page-object';
import {groupApprovalButton} from 'percy-web/tests/pages/components/group-approval-button';
import {alias} from 'ember-cli-page-object/macros';

const SELECTORS = {
  SCOPE: '[data-test-snapshot-group]',
  APPROVED_BUBBLE: '[data-test-group-approved]',
  NAME: '[data-test-snapshot-group-name]',
};

export const snapshotGroup = {
  scope: SELECTORS.SCOPE,
  groupApprovalButton,

  name: text(SELECTORS.NAME),

  isApproved: alias('groupApprovalButton.isApproved'),
  clickApprove: alias('groupApprovalButton.clickButton'),
};

export default create(snapshotGroup);
