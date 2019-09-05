import accounting from 'accounting';

export default {
  formatNumber(value, options) {
    options = options || {precision: 0};
    return accounting.formatNumber(value, options.precision);
  },
  formatCurrency(value, options) {
    options = options || {precision: 2};
    return accounting.formatMoney(value, null, options.precision);
  },
  formatThousands(value) {
    return Math.abs(value) > 999
      ? Math.sign(value) * (Math.abs(value) / 1000).toFixed(1) + 'k'
      : Math.sign(value) * Math.abs(value);
  },
};
