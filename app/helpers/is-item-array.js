import {helper} from '@ember/component/helper';

export function isItemArray([item]) {
  if (!item) {
    return false;
  } else {
    return Array.isArray(item);
  }
}

export default helper(isItemArray);
