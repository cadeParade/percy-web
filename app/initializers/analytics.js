export function initialize(application) {
  application.inject('component', 'analytics', 'service:analytics');
  application.inject('controller', 'analytics', 'service:analytics');
  application.inject('route', 'analytics', 'service:analytics');
}

export default {
  name: 'analytics',
  initialize: initialize,
};
