import Service from '@ember/service';
import {setProperties} from '@ember/object';
import {defer} from 'rsvp';

export default Service.extend({
  showPrompt: false,
  title: null,
  message: null,

  _deferred: null,

  ask({title, message}) {
    setProperties(this, {
      _deferred: defer(),
      showPrompt: true,
      title: title || 'Are you sure?',
      message,
    });

    return this._deferred.promise;
  },

  confirm() {
    this._deferred.resolve(true);

    setProperties(this, {
      showPrompt: false,
      _deferred: null,
    });
  },

  cancel() {
    this._deferred.resolve(false);

    setProperties(this, {
      showPrompt: false,
      _deferred: null,
    });
  },

  actions: {
    confirm() {
      this.confirm();
    },

    cancel() {
      this.cancel();
    },
  },
});
