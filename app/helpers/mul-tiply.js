import {helper} from '@ember/component/helper';

export function isItemArray([num, multiplier]) {
  return num * multiplier
}

export default helper(isItemArray);
