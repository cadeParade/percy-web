import Service, {inject as service} from '@ember/service';
import {alias} from '@ember/object/computed';
import {computed} from '@ember/object';
import {run} from '@ember/runloop';
import config from '../config/environment';

export default Service.extend({
  store: service(),
  session: service(),
  currentUser: alias('session.currentUser'),
  flashMessages: service(),

  subscribeToUser(user) {
    if (this.get('hasSubscribedToUser')) {
      return;
    }

    this.subscribe(`User-${user.get('id')}`, 'userNotification', notification => {
      run.scheduleOnce('afterRender', this, this._flashNotify, notification);
    });
    this.subscribe('everyone', 'objectUpdated', data => {
      run.scheduleOnce('afterRender', this, this._pushPayload, data);
    });

    this.set('hasSubscribedToUser', true);
  },

  subscribeToOrganization(organization) {
    this.subscribe(`Organization-${organization.get('id')}`, 'objectUpdated', data => {
      run.scheduleOnce('afterRender', this, this._pushPayload, data);
    });
  },

  subscribe(channelName, event, callback) {
    const channel = this.get('_client').subscribe(channelName);
    channel.bind(event, callback);
  },

  _pushPayload(data) {
    this.get('store').pushPayload(data);
  },

  _flashNotify(notification) {
    // this.get('flashMessages').info(notification);
    this.get('flashMessages').info(notification.message);
  },

  _client: computed(function() {
    //eslint-disable-next-line
    return new Pusher(config.PUSHER_APP_KEY, {
      cluster: config.PUSHER_APP_CLUSTER,
    });
    // return new Pusher({
    //   appId: config.PUSHER_APP_ID,
    //   key: config.PUSHER_APP_KEY,
    //   secret: config.PUSHER_APP_SECRET,
    //   cluster: config.PUSHER_APP_CLUSTER,
    //   logToConsole: config.PUSHER_LOG,
    //   encrypted: config.PUSHER_ENCRYPT,
    // });
  }),
});
