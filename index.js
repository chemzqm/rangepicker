
/**
 * Module dependencies.
 */

var Calendar = require('calendar')
  , Popover = require('popover')
  , Emitter = require('emitter')
  , event = require('event')
  , o = require('jquery');
  

/**
 * Expose `Rangepicker`.
 */

module.exports = Rangepicker;

function initCalendar () {
  var cal = new Calendar();
  cal.showMonthSelect();
  var d = new Date();
  var to = d.getFullYear();
  var from = to - 20;
  cal.showYearSelect(from, to);
  cal.el.addClass('datepicker-calendar');
  return cal;
}

/**
 * Initialize a new date picker with the given input `el`.
 *
 * @param {Element} el
 * @api public
 */

function Rangepicker(el) {
  if (!(this instanceof Rangepicker)) return new Rangepicker(el);
  this.actions = o(require('./template'));
  this.actions.find('.cancel').click(this.oncancel.bind(this));
  this.actions.find('.ok').click(this.onok.bind(this));
  this.el = el;
  this.fromCal = initCalendar();
  this.toCal = initCalendar();
  event.bind(el, 'click', this.onclick.bind(this));
}

/**
 * Mixin emitter.
 */

Emitter(Rangepicker.prototype);

/**
 * Handle input clicks.
 */

Rangepicker.prototype.onclick = function(e){
  if (this.popover) return;
  var body = this.actions.find('.rangepicker-body');
  body.append(this.fromCal.el);
  body.append(this.toCal.el);
  var dates = this.getValue();
  if (dates && dates.length === 2) {
    this.fromCal.select(new Date(dates[0]));
    this.toCal.select(new Date(dates[1]));
  }
  this.popover = new Popover(this.actions);
  this.popover.position('north', {
      auto: false
    })
  this.popover.classname = 'datepicker-popover popover';
  this.popover.show(this.el);
};

Rangepicker.prototype.onok = function(e){
  var fd = this.fromCal.getDateString();
  var td = this.toCal.getDateString();
  var revert = this.fromCal._date.getTime() > this.toCal._date.getTime()? true:false;
  if (revert) {
    this.el.value = td + '-' + fd;
  } else {
    this.el.value = fd + '-' + td;
  }
  var value = this.getValue();
  this.emit('change', value);
  this.popover.remove();
  this.popover = null;
};

Rangepicker.prototype.oncancel = function(e){
  this.popover.remove();
  this.popover = null;
};

Rangepicker.prototype.getValue = function() {
  var str = this.el.value;
  var res = [];
  var ds = str.split('-');
  var start_date;
  var end_date;
  ds.forEach(function(v, i) {
    var ms = v.match(/(\d{4}).(\d{1,2}).(\d{1,2})/);
    if (ms) { res.push(ms[1] + '-' + ms[2] + '-' + ms[3]); }
  },this);
  return res;
}
