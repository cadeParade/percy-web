import Component from '@ember/component';
import isUserMemberPromise from 'percy-web/lib/is-user-member-of-org';
import {computed} from '@ember/object';
import {task} from 'ember-concurrency';

export default Component.extend({
  organization: null,

  isUserMember: computed('organization', function() {
    return this.get('getIsUserMember').perform(this.get('organization'));
  }),

  getIsUserMember: task(function*(org) {
    return yield isUserMemberPromise(org);
  }),
});
