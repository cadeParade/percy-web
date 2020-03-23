import {expect} from 'chai';
import {it, describe} from 'mocha';
import {returnFormattedThresholds} from 'percy-web/models/usage-notification-setting';

describe('usageNotificationSetting', function () {
  describe('returnFormattedThresholds', function () {
    it('handles null', function () {
      expect(returnFormattedThresholds(null)).to.equal(null);
    });

    it('handles arrays', function () {
      expect(returnFormattedThresholds(['1', '2000', '3100100'])).to.equal('1 2,000 3,100,100');
      expect(returnFormattedThresholds(['1', '2,000', '3,100,100'])).to.equal('1 2,000 3,100,100');
    });

    it('handles strings', function () {
      expect(returnFormattedThresholds('1 2,000 3,100,100')).to.equal('1 2,000 3,100,100');
      expect(returnFormattedThresholds('1 2000 3100100')).to.equal('1 2,000 3,100,100');
      expect(returnFormattedThresholds('1, 2000, 3100100')).to.equal('1 2,000 3,100,100');
    });
  });
});
