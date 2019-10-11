import $ from 'jquery';
import Ember from 'ember';

export function initialize() {
  if (typeof FastBoot === undefined) {
    $.ajaxPrefilter((options, originalOptions, xhr) => {
      if (!options.crossDomain && !Ember.testing) {
        const cookieValue = document.cookie.match(/XSRF-TOKEN=([^;]*)/);
        if (cookieValue && cookieValue.length > 1) {
          const token = decodeURIComponent(cookieValue[1]);
          if (token) {
            xhr.setRequestHeader('X-CSRF-Token', token);
          }
        }
      }
    });
  }
}

export default {
  name: 'csrf-protection',
  initialize: initialize,
};
