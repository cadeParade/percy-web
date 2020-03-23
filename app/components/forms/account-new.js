import {computed, get} from '@ember/object';
import {run} from '@ember/runloop';
import Changeset from 'ember-changeset';
import lookupValidator from 'ember-changeset-validations';
import {inject as service} from '@ember/service';
import EnsureStatefulLogin from 'percy-web/mixins/ensure-stateful-login';
import AccountNewValidations from 'percy-web/validations/account-new';
import $ from 'jquery';
import utils from 'percy-web/lib/utils';
import BaseFormComponent from './base';

export default BaseFormComponent.extend(EnsureStatefulLogin, {
  session: service(),
  store: service(),
  model: null,
  validator: AccountNewValidations,

  changeset: computed('model', 'validator', function () {
    // Model is not actually used as we have a custom save method
    let model = this.model;
    let validator = this.validator || {};

    return new Changeset(model, lookupValidator(validator), validator);
  }),

  actions: {
    save() {
      let changeset = this.changeset;

      changeset.validate();

      if (get(changeset, 'isValid')) {
        let desiredPassword = changeset.get('changes')[0]['value'];

        this.set('isSaveSuccessful', null);
        this.set('isSaving', true);
        this.set('errorMessage', null);

        $.ajax({
          type: 'POST',
          url: utils.buildApiUrl('identities'),
          data: {data: {attributes: {password: desiredPassword}}},
        })
          .done(() => {
            // Make sure Ember runloop knows about the ajax situation.
            run(() => {
              this.set('isSaveSuccessful', true);
              this.set('isSaving', false);
              this.saveSuccess();
            });
          })
          .fail(response => {
            run(() => {
              let errorData = response.responseJSON['errors'];

              errorData.forEach(error => {
                if (error['detail']) {
                  changeset.addError('password', [error['detail']]);
                }
              });

              this.set('isSaving', false);
              this.set('isSaveSuccessful', false);
            });
          });
      }
    },
  },
});
