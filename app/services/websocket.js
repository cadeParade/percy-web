import Service, {inject as service} from '@ember/service';
import {computed} from '@ember/object';
import config from '../config/environment';
import utils from 'percy-web/lib/utils';
import Pusher from 'pusher-js';
import {assert} from '@ember/debug';
import {isPresent} from '@ember/utils';

export default Service.extend({
  store: service(),
  raven: service(),
  _socket_instance: null,

  disconnect() {
    if (!this._socket) return;
    this._socket.disconnect();
  },

  subscribeToOrganization(organization) {
    // const channelName = `private-organization-${organization.id}`;
    // this._subscribe(channelName, 'objectUpdated', data => {
    //   this.store.pushPayload(data);
    // });
  },

  _bindEvents(channel, event, callback) {
    channel.bind(event, callback);
  },

  _isSubscribed(channelName) {
    return this._socket && isPresent(this._socket.channel(channelName));
  },

  _subscribe(channelName, event, callback) {
    // if (!this._socket) return;
    // if (this._isSubscribed(channelName)) {
    //   return;
    // }
    // const channel = this._socket.subscribe(channelName);
    // this._bindEvents(channel, event, callback);
  },

  _socket: computed({
    get() {
      // if (this._socket_instance) {
      //   return this._socket_instance;
      // }
      // const cookieValue = document.cookie.match(/XSRF-TOKEN=([^;]*)/);
      // if (!cookieValue) return;
      // const csrfToken = decodeURIComponent(cookieValue[1]);
      // this._socket_instance = new Pusher(config.APP.PUSHER_APP_KEY, {
      //   cluster: config.APP.PUSHER_APP_CLUSTER,
      //   authEndpoint: utils.buildApiUrl('websocketsAuth'),
      //   auth: {
      //     headers: {'X-CSRF-Token': csrfToken},
      //   },
      // });
      // return this._socket_instance;
    },
    set(key, value) {
      // assert('Only set `_socket` for tests.', config.environment === 'test');
      // this._socket_instance = value;
      // return value;
    },
  }),
});
