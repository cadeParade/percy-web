import Service from '@ember/service';
import {task} from 'ember-concurrency';

// This file relies heavily on the tributejs api.
// Docs for which can be found here: perhaps a link to https://github.com/zurb/tribute#a-collection
export default Service.extend({
  generateOrgUserConfig(organization) {
    const fetchFn = async (text, cb) => {
      const users = await this._getOrgUsers.perform(organization);
      cb(users);
    };

    return generateTributeUserConfig(fetchFn);
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
              flex-no-shrink
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
