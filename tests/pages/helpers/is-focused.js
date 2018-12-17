import {findElementWithAssert} from 'ember-cli-page-object';

export default function isFocused(selector, options = {}) {
  return {
    isDescriptor: true,
    get() {
      return findElementWithAssert(this, selector, options).get(0) === document.activeElement;
    },
  };
}
