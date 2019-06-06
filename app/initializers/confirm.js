export function initialize(application) {
  application.inject('controller', 'confirm', 'service:confirm');
}

export default {
  name: 'confirm',
  initialize: initialize,
};
