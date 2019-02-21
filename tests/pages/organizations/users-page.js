import {visitable, create} from 'ember-cli-page-object';

const UsersPage = {
  visitUsersPage: visitable('/organizations/:orgSlug/users'),
  visitInvitePage: visitable('/organizations/:orgSlug/users/invite'),
};

export default create(UsersPage);
