import {helper} from '@ember/component/helper';
import {isUserAdminOfOrg} from 'percy-web/lib/is-user-member-of-org';

export default helper(([user, organization]) => {
  return isUserAdminOfOrg(user, organization);
});
