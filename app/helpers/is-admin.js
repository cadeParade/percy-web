import {helper} from '@ember/component/helper';
import AdminMode from 'percy-web/lib/admin-mode';

export default helper(function () {
  return AdminMode.isAdmin();
});
