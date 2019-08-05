import Component from '@ember/component';

export default Component.extend({
  // In this case, we pass classes through to the input element itself.
  classes: null,
  value: 'Submit',
  disabled: false,

  confirmationMessage: null,
  isSaving: null,
  isSaveSuccessful: null,

  classNames: ['FormFieldsSubmit'],
  actions: {
    perform() {
      let confirmationMessage = this.confirmationMessage;
      if (confirmationMessage && !confirm(confirmationMessage)) {
        return;
      }
      this.submit();
    },
  },
});
