import Service from '@ember/service';
import {setProperties, action} from '@ember/object';
import {defer} from 'rsvp';

export default class ConfirmService extends Service {
  showPrompt = false;
  title = null;
  message = null;
  _deferred = null;

  ask({title, message}) {
    setProperties(this, {
      _deferred: defer(),
      showPrompt: true,
      title: title || 'Are you sure?',
      message,
    });

    return this._deferred.promise;
  }

  promiseConfirm() {
    this._deferred.resolve(true);

    setProperties(this, {
      showPrompt: false,
      _deferred: null,
    });
  }

  promiseCancel() {
    this._deferred.resolve(false);

    setProperties(this, {
      showPrompt: false,
      _deferred: null,
    });
  }

  @action
  confirm() {
    this.promiseConfirm();
  }

  @action
  cancel() {
    this.promiseCancel();
  }
}
