import {helper} from '@ember/component/helper';
import Formatting from '../lib/formatting';

function formatThousands([value]) {
  return Formatting.formatThousands(value);
}

export default helper(formatThousands);
