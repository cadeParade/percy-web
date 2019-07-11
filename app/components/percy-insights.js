import {or} from '@ember/object/computed';
import Component from '@ember/component';
import {computed, get} from '@ember/object';
import {alias, readOnly} from '@ember/object/computed';
import {htmlSafe} from '@ember/string';
import {inject as service} from '@ember/service';

export default Component.extend({
  store: service(),
  buildsInLastMonth: 206,
  buildsAllTime: 19999,
  snapshotsInLastMonth: 81713,
  snapshotsLast60Days: 182692,
  buildsApprovedInLastMonth: 46,
  snapshotsAllTime: 1265494,
  numCommentsInLastMonth: 214,

  faun: computed('orgUsers.@each.id', function() {
    return this.orgUsers.findBy('id', '2952');
  }),
  lindsay: computed('orgUsers.@each.id', function() {
    return this.orgUsers.findBy('id', '1909');
  }),
  derek: computed('orgUsers.@each.id', function() {
    return this.orgUsers.findBy('id', '4400');
  }),
  rylee: computed('orgUsers.@each.id', function() {
    return this.orgUsers.findBy('id', '7257');
  }),
  tim: computed('orgUsers.@each.id', function() {
    return this.orgUsers.findBy('id', '2524');
  }),
  payton: computed('orgUsers.@each.id', function() {
    return this.orgUsers.findBy('id', '5547');
  }),
  robert: computed('orgUsers.@each.id', function() {
    return this.orgUsers.findBy('id', '1971');
  }),
  paul: computed('orgUsers.@each.id', function() {
    return this.orgUsers.findBy('id', '4373');
  }),
  mike: computed('orgUsers.@each.id', function() {
    return this.orgUsers.findBy('id', '1');
  }),
  david: computed('orgUsers.@each.id', function() {
    return this.orgUsers.findBy('id', '3114');
  }),

  orgUsers: computed(function() {
    const orgUsers = this.store.peekAll('organization-user').filter(function(orgUser) {
      return orgUser.organization.id === '2';
    });
    return orgUsers.mapBy('user');
  }),

  didRender() {
    this._super(...arguments);
    const buildsApproved = new CountUp('buildsApproved',0, this.buildsApprovedInLastMonth, 0, randomDuration());
    const buildsInLastMonth = new CountUp('buildsInLastMonth',0, this.buildsInLastMonth, 0, randomDuration());
    const buildsAllTime = new CountUp('buildsAllTime',0, this.buildsAllTime, 0, randomDuration());
    const snapshotsInLastMonth = new CountUp('snapshotsInLastMonth',0, this.snapshotsInLastMonth, 0, randomDuration());
    const snapshotsLast60Days = new CountUp('snapshotsLast60Days', 0, this.snapshotsLast60Days, 0, randomDuration());
    const snapshotsAllTime = new CountUp('snapshotsAllTime', 0, this.snapshotsAllTime, 0, randomDuration())
    // const numCommentsInLastMonth = new CountUp('numCommentsInLastMonth',0, this.numCommentsInLastMonth, 0, randomDuration());
    if (!buildsApproved.error) {
      buildsApproved.start();
      buildsInLastMonth.start();
      buildsAllTime.start();
      snapshotsInLastMonth.start();
      snapshotsLast60Days.start();
      snapshotsAllTime.start();
      // numCommentsInLastMonth.start();

    } else {
      console.error(buildsApproved.error);
    }
  },

  notableBuilds: computed(function() {
    return [
      {
        buildId: 2026754,
        buildNumber: 6961,
        commentCount: 19,
        branch: 'lc/silent-auth-when-in-inconsistent-session-state',
      },
      {
        buildId: 2009563,
        buildNumber: 6943,
        commentCount: 18,
        branch: 'lc/fullscreen-formatting-fix',
      },
      {
        buildId: 2010858,
        buildNumber: 6951,
        commentCount: 18,
        branch: 'lc/comment-finesse',
      },
      {
        buildId: 2129366,
        buildNumber: 7100,
        commentCount: 15,
        branch: 'lc/decrease-network-idle-timeout',
      },
      {
        buildId: 2016749,
        buildNumber: 6954,
        commentCount: 10,
        branch: 'design/collab-polish',
      },
      {
        buildId: 2008217,
        buildNumber: 6938,
        commentCount: 9,
        branch: 'lc/small-improvements',
      },
      {
        buildId: 2114896,
        buildNumber: 7076,
        commentCount: 6,
        branch: 'rk/group_cover_with_comments',
      },
    ];
  }),

  commentsByPerson: computed(function() {
    return [
      {
        user: this.lindsay,
        note: 88,
        review: 24,
        total: 112,
      },
      {
        user: this.payton,
        note: 11,
        review: 8,
        total: 19,
      },
      {
        user: this.rylee,
        note: 16,
        review: 2,
        total: 18,
      },
      {
        user: this.mike,
        note: 13,
        review: 5,
        total: 18,
      },
      {
        user: this.robert,
        note: 11,
        review: 4,
        total: 15,
      },
      {
        user: this.derek,
        note: 8,
        review: 4,
        total: 12,
      },
      {
        user: this.tim,
        note: 6,
        review: 3,
        total: 9,
      },
      {
        user: this.david,
        note: 3,
        review: 4,
        total: 7,
      },
      {
        user: this.paul,
        note: 1,
        review: 1,
        total: 2,
      },
      {
        user: this.faun,
        note: 2,
        review: 0,
        total: 2,
      },
    ];
  }),

  buildsApprovedByPerson: computed(function() {
    return [
      {
        user: this.lindsay,
        count: 41,
      },
      {
        user: this.derek,
        count: 2,
      },
      {
        user: this.rylee,
        count: 2,
      },
      {
        user: this.faun,
        count: 1,
      },
      {
        user: this.tim,
        count: 0,
      },
      {
        user: this.david,
        count: 0,
      },
      {
        user: this.mike,
        count: 0,
      },
      {
        user: this.payton,
        count: 0,
      },
      {
        user: this.paul,
        count: 0,
      },
      {
        user: this.robert,
        count: 0,
      },
    ];
  }),

  // data: [
  //   {
  //     count: 300,
  //     user: this.lindsay,
  //     percentOfHeight: 42,
  //   },
  //   {
  //     count: 234,
  //     user: this.faun ,
  //     percentOfHeight: 22,
  //   },
  //   {
  //     count: 12,
  //     user: this.rylee ,
  //     percentOfHeight: 57,
  //   }
  // ],

  // userApprovalsChartOptions: {
  //   chart: {type: 'bar'},
  //   title: {text: 'Who approved builds this month?'}
  // },
  // userApprovalChartData: computed('model', function() {
  //   const model = this.model;
  //   console.log('model', model.users);
  //   return [{
  //     name: 'Build approval per user',
  //     data: [
  //       {
  //         x: 41,
  //         name: this.store.peekRecord('user', 1909).name,
  //       },
  //       {
  //         x: 1,
  //         name: this.store.peekRecord('user', 2952).name,
  //       },
  //       {
  //         x: 2,
  //         name: this.store.peekRecord('user', 4400).name,
  //       },
  //       {
  //         x: 2,
  //         name: this.store.peekRecord('user', 7257).name,
  //       },
  //     ]
  //   }];
  // }),

  userApprovalChartOptions: {
    chart: {type: 'bar'},
    xAxis: {
      categories: ['Lindsay', 'David', 'Rylee', 'Derek'],
    },
    yAxis: {
      max: 50,
    },
    plotOptions: {
      series: {
        dataLabels: {
          enabled: true,
          align: 'right',
          color: '#FFFFFF',
          x: -10,
        },
      },
    },
  },

  userApprovalChartData: [
    {
      data: [41, 1, 2, 2],
    },
  ],

  commentChartOptions: {
    chart: {
      type: 'pie',
    },
    title: {
      text: '',
    },
  },

  commentChartData: [
    {
      name: 'Comment types',
      data: [
        {
          y: 159,
          name: 'Note comments',
          color: "#d7b5e5",
        },
        {
          y: 55,
          name: 'Review comments',
          color: "#e1dfe2",
        },
      ],
    },
  ],

  pieChartOptions: {
    chart: {
      type: 'pie',
    },
    title: {
      text: '',
    },
  },

  pieChartData: [
    {
      name: 'Snapshot diff overview',
      data: [
        {
          y: 78535,
          name: 'No diffs',
          color: "#d7b5e5",
        },
        {
          y: 3178,
          name: 'With diffs',
          color: "#e1dfe2",
        },
      ],
    },
  ],
});

function randomDuration() {
  const min=0.5;
  const max=2;
  const random = Math.random() * (+max - +min) + +min;
  return random
}
