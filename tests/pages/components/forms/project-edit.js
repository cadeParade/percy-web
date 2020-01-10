import {create, clickable, fillable, property, isVisible, text} from 'ember-cli-page-object';

const SELECTORS = {
  PROJECT_EDIT_FORM: '[data-test-project-edit-form]',
  BRANCH_SETTINGS_HEADER: '[data-test-branch-settings-header]',
  PUBLIC_CHECKBOX: '[data-test-checkbox-input="data-test-project-edit-public-checkbox"]',
  PUBLIC_CHECKBOX_LABEL: '[data-test-toggle-checkbox-label]',
  PUBLIC_CHECKBOX_SLIDER: '[data-test-toggle-checkbox-slider]',
  PUBLIC_CHECKBOX_DOT: '[data-test-toggle-checkbox-dot]',
  PROJECT_NAME_INPUT: '[data-test-form-input="data-test-project-edit-name"]',
  PROJECT_SLUG_INPUT: '[data-test-form-input="data-test-project-edit-slug"]',
  AUTO_APPROVE_FILTER_INPUT: '[data-test-form-input="data-test-project-edit-autoapprove"]',
  ERRORS: '[data-test-project-edit-errors]',
  SAVE_BUTTON: '[data-test-form-submit-button]',
};

export const ProjectEdit = {
  scope: SELECTORS.PROJECT_EDIT_FORM,

  isBranchSettingsVisible: isVisible(SELECTORS.BRANCH_SETTINGS_HEADER),

  fillInProjectName: fillable(SELECTORS.PROJECT_NAME_INPUT),
  fillInProjectSlug: fillable(SELECTORS.PROJECT_SLUG_INPUT),
  fillInAutoApproveBranchFilter: fillable(SELECTORS.BRANCH_SETTINGS_HEADER),

  isPublicCheckboxDisabled: property('disabled', SELECTORS.PUBLIC_CHECKBOX),
  isPublicCheckboxChecked: property('checked', SELECTORS.PUBLIC_CHECKBOX),
  togglePublicCheckbox: clickable(SELECTORS.PUBLIC_CHECKBOX),

  clickSave: clickable(SELECTORS.SAVE_BUTTON),

  errorText: text(SELECTORS.ERRORS),

  isNameDisabled: property('disabled', SELECTORS.PROJECT_NAME_INPUT),
  isSlugDisabled: property('disabled', SELECTORS.PROJECT_SLUG_INPUT),
  isAutoApproveInputDisabled: property('disabled', SELECTORS.AUTO_APPROVE_FILTER_INPUT),
};

export default create(ProjectEdit);
