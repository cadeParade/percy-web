import Controller from '@ember/controller';
import {inject as service} from '@ember/service';
import {computed} from '@ember/object';

export default Controller.extend({
  buildsInLastMonth: 206,
  buildsAllTime: 19999,
  snapshotsInLastMonth: 81713,
  buildsApprovedInLastMonth: 46,
  numCommentsInLastMonth: 214,

  david: computed(function() {
    return this.store.peekRecord('user', 2952);
  }),
  lindsay: computed(function() {
    return this.store.peekRecord('user', 1909);
  }),
  derek: computed(function() {
    return this.store.peekRecord('user', 4400);
  }),
  rylee: computed(function() {
    return this.store.peekRecord('user', 7257);
  }),

  buildsApprovedByPerson: computed(function() {
    return [
      {
        user: this.lindsay,
        count: 41,
      },
      {
        user: this.david,
        count: 1,
      },
      {
        user: this.derek,
        count: 2,
      },
      {
        user: this.rylee,
        count: 2,
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
  //     user: this.david ,
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
      categories: ['Lindsay', 'David', 'Rylee', 'Derek']
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
      }
    }
  },

  userApprovalChartData: [{
    data: [41, 1, 2, 2],
  }],


  commentChartOptions: {
    chart: {
      type: 'pie',
    },
    title: {
      text: '',
    },
  },


  commentChartData: [{
    name: 'Comment types',
    data: [{
      y: 55,
      name: 'Review comments'
    }, {
      y: 159,
      name: 'Note comments',
    }],
  }],



  pieChartOptions: {
    chart: {
      type: 'pie',
    },
    title: {
      text: '',
    },
  },


  pieChartData: [{
    name: 'Snapshot diff overview',
    data: [{
      y: 78535,
      name: 'no diffs'
    }, {
      y: 3178,
      name: 'with diffs',
    }],
  }],
})




