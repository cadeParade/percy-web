import {RepoLinkerItem} from 'percy-web/tests/pages/components/organizations/repo-linker-item';
import {create, collection, isVisible} from 'ember-cli-page-object';

export const SELECTORS = {
  LIST_HEADER: '[data-test-repo-linker-list-header]',
};

export const RepoLinkerList = {
  isListHeaderVisible: isVisible(SELECTORS.LIST_HEADER),
  listItems: collection(RepoLinkerItem.scope, RepoLinkerItem),
};

export default create(RepoLinkerList);
