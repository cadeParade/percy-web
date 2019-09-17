import {create, collection, isVisible, text} from 'ember-cli-page-object';
import {InviteCard} from 'percy-web/tests/pages/components/organizations/invite-card';
import {UserCard} from 'percy-web/tests/pages/components/organizations/user-card';

const SELECTORS = {
  CONTAINER: '[data-test-manage-users-list]',
  USERS_HEADERS: '[data-test-manage-users-users-header]',
};

export const ManageUsersList = {
  scope: SELECTORS.CONTAINER,
  columnHeaders: text(SELECTORS.USERS_HEADERS),

  inviteCards: collection(InviteCard.scope, InviteCard),

  userCards: collection(UserCard.scope, UserCard),
  usersHeader: {
    scope: SELECTORS.USERS_HEADERS,
    isVisible: isVisible(),
  },
};

export default create(ManageUsersList);
