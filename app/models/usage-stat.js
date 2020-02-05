import {computed} from '@ember/object';
import Model, {attr} from '@ember-data/model';
import moment from 'moment';

export default class UsageStat extends Model {
  @attr()
  total;

  @attr()
  dayStats;

  @attr()
  currentCost;

  @computed('dayStats')
  get dayStatsFormatted() {
    const dayStats = this.dayStats;
    if (!dayStats) {
      return [];
    }

    return dayStats.map(dayStat => [moment.utc(dayStat[0]), dayStat[1]]);
  }

  // Everything in the API is in cents, but we need to display dollars, so divide by 100.
  @computed('currentCost')
  get currentCostDollars() {
    return this.currentCost / 100;
  }
}
