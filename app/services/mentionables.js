import Service from '@ember/service';
import {computed} from '@ember/object';
import {task} from 'ember-concurrency';
import emojis from 'percy-web/lib/emoji';

// This file relies heavily on the tributejs api.
// Docs for which can be found here: perhaps a link to https://github.com/zurb/tribute#a-collection
export default Service.extend({
  _emojis: computed(function() {
    return emojis.filter(emoji => {
      // Include versions up to 12. Version 12 is not yet well supported.
      return parseFloat(emoji.unicode_version) < 12;
    });
  }),

  generateOrgUserConfig(organization) {
    const fetchFn = async (text, cb) => {
      const users = await this._getOrgUsers.perform(organization);
      const sortedUsers = users.sortBy('name');
      cb(sortedUsers);
    };

    return generateTributeUserConfig(fetchFn);
  },

  generateEmojiConfig() {
    const fetchFn = async (text, cb) => {
      cb(this._emojis);
    };

    return generateTributeEmojiConfig(fetchFn);
  },

  _getOrgUsers: task(function*(organization) {
    const orgUsersRef = organization.hasMany('organizationUsers');
    let orgUsers = yield orgUsersRef.load();
    return orgUsers.mapBy('user');
  }),

  // We only can listen to when a user adds an @mention. We have no way of telling if they
  // have consequently deleted the text of the @mention. So this function checks that
  // the users in @mention list are still there upon sending them to the API.
  verifyMentions(mentionedUsers, commentBody) {
    return mentionedUsers.reduce((acc, user) => {
      if (commentBody.includes(`@${user.name}`)) {
        acc.push(user);
      }
      return acc;
    }, []);
  },
});

export function generateTributeEmojiConfig(fetchFn) {
  return {
    values: (text, cb) => {
      fetchFn(text, emojis => cb(emojis));
    },
    lookup(emoji) {
      return emoji.aliases.join(' ');
    },
    trigger: ':',
    menuItemLimit: 25,
    menuItemTemplate(emojiObject) {
      return `
        <div class="flex items-center" style="max-width:200px;">
          <div class="text-2xl">${emojiObject.original.emoji}</div>
        </div>
      `;
    },
    selectTemplate(emojiObject) {
      return emojiObject.original.emoji;
    },
  };
}

export function generateTributeUserConfig(fetchFn) {
  return {
    values: (text, cb) => {
      fetchFn(text, users => cb(users));
    },
    lookup: 'name',
    menuItemTemplate(user) {
      return `
        <div class="flex items-center">
          <img
            src=${user.original.avatarUrl}
            class="
              flex-shrink-0
              w-20
              h-20
              rounded-full
              border
              border-gray-200
              overflow-hidden
              mr-1">
          <div class="font-semibold truncate">
            ${user.original.name}
          </div>
        </div>
      `;
    },
    selectTemplate(user) {
      return `@${user.original.name}`;
    },
  };
}
