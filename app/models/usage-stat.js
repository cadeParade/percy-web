import Model, {attr} from '@ember-data/model';
import {computed} from '@ember/object';
import moment from 'moment';

export default Model.extend({
  total: attr(),
  dayStats: attr(),
  currentCost: attr(),

  dayStatsFormatted: computed('dayStats', function() {
    const dayStats = this.dayStats;
    if (!dayStats) {
      return;
    }

    return dayStats.map(dayStat => [moment.utc(dayStat[0]), dayStat[1]]);
  }),

  // Everything in the API is in cents, but we need to display dollars, so divide by 100.
  currentCostDollars: computed('currentCost', function() {
    return this.currentCost / 100;
  }),
});
