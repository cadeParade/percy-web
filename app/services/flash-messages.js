import FlashMessageService from 'ember-cli-flash/services/flash-messages';
import localStorageProxy from 'percy-web/lib/localstorage';

export default FlashMessageService.extend({
  add(flashMessageOptions) {
    // These set default titles for each type of flash message
    // If a title is sent in with `flashMessageOptions`, these will not override
    if (!flashMessageOptions.title) {
      if (flashMessageOptions.type === 'success') {
        flashMessageOptions.title = 'Awesome!';
      }
      if (flashMessageOptions.type === 'danger') {
        flashMessageOptions.title = 'Oh Snap.';
      }
      if (flashMessageOptions.type === 'warning') {
        flashMessageOptions.title = 'Looky here...';
      }
      if (flashMessageOptions.type === 'info') {
        flashMessageOptions.title = 'Heads up!';
      }
    }
    this._super(...arguments);
  },

  /**
   * @method createPersistentFlashMesssage
   *
   * Sets flash message data in localStorage to load on subsequent page reloads.
   * Should not be necessary to use often, but is occasionally important
   * (as in the case of surfacing an error message to users
   * on login failure after several redirects)
   *
   * @param flashMessageOptions {Object} Object containing hash of options, ex:
   *   {
   *     type: 'danger',
   *     message: "text to display",
   *     sticky: true,
   *     ...
   *   }
   * @param persistentReloads {Integer} Number of full page reloads
   *   the message should persist through
   * @return {undefined}
   */
  createPersistentFlashMessage(options, {persistentReloads = 0} = {}) {
    if (persistentReloads) {
      localStorageProxy.set(`flash-message-${Date.now()}`, {
        options,
        persistentReloads,
      });
    }

    this.add(options);
  },

  displayLocalStorageMessages() {
    // const flashMessages = localStorageProxy.keysWithString('flash-message');

    // flashMessages.forEach(messageKey => {
    //   const messageContent = localStorageProxy.get(messageKey);
    //   const numReloadsLeft = messageContent.persistentReloads;

    //   if (numReloadsLeft <= 0) {
    //     localStorageProxy.removeItem(messageKey);
    //   } else {
    //     messageContent.persistentReloads = messageContent.persistentReloads - 1;
    //     localStorageProxy.set(messageKey, messageContent);

    //     this.add(messageContent.options);
    //   }
    // });
  },
});
