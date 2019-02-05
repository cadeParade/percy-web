import {findElementWithAssert} from 'ember-cli-page-object';
import {getter} from 'ember-cli-page-object/macros';

export default function isFocused(selector, options = {}) {
  return getter(function() {
    return findElementWithAssert(this, selector, options).get(0) === document.activeElement;
  });
}
