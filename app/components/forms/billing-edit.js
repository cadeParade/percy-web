import {not, readOnly} from '@ember/object/computed';
import BaseFormComponent from './base';
import SubscriptionValidations from 'percy-web/validations/subscription';

export default BaseFormComponent.extend({
  subscription: null,

  model: readOnly('subscription'),
  validator: SubscriptionValidations,

  isSubmitEnabled: readOnly('changeset.isValid'),
  isSubmitDisabled: not('isSubmitEnabled'),
});
