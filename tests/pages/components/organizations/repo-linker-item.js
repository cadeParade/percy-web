import {create, is} from 'ember-cli-page-object';

export const SELECTORS = {
  REPO_LINKER_ITEM: '[data-test-repo-linker-item]',
  LINK_STATUS: '[data-test-repo-linker-status]',
};

export const RepoLinkerItem = {
  scope: SELECTORS.REPO_LINKER_ITEM,
  isLinked: is('.opacity-0', SELECTORS.LINK_STATUS),
};

export default create(RepoLinkerItem);
