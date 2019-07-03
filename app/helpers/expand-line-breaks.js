import {helper} from '@ember/component/helper';
import {htmlSafe} from '@ember/template';

export function expandLineBreaks([text]) {
  if (!text) return;
  return new htmlSafe(text.replace(/\n/g, '<br>'));
}

export default helper(expandLineBreaks);
