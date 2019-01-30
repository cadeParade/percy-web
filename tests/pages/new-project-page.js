import {fillable, create, clickable} from 'ember-cli-page-object';

const SELECTORS = {
  PROJECT_NAME_INPUT: '[data-test-form-input=project-name-input]',
  SUBMIT: '[data-test-form-submit-button]',
};

export const NewProjectPage = {
  fillInProjectName: fillable(SELECTORS.PROJECT_NAME_INPUT),
  clickSubmit: clickable(SELECTORS.SUBMIT),
};

export default create(NewProjectPage);
