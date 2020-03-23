import {htmlSafe} from '@ember/string';
import {helper} from '@ember/component/helper';

export default helper(function (params) {
  return htmlSafe(params.join(''));
});
