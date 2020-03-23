import {helper} from '@ember/component/helper';

export default helper(function () {
  let location = window.location;
  return location.origin + location.pathname;
});
