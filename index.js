
/**
 * Module dependencies.
 */

var Calendar = require('calendar')
  , Tip = require('tip')
  , Emitter = require('emitter')
  , event = require('event')
  , o = require('jquery');

function initCalendar () {
  var cal = new Calendar();
  cal.showMonthSelect();
  var d = new Date();
  var to = d.getFullYear();
  var from = to - 20;
  cal.showYearSelect(from, to);
  cal.el.addClass('rangepicker-calendar');
  return cal;
}

/**
 * Initialize a new date picker with the given input `el`.
 *
 * @param {Element} el
 * @api public
 */

function Rangepicker(el) {
  if (!(this instanceof Rangepicker)){ return new Rangepicker(el); }
  this.body = o(require('./template'));
  this.trigger = el;
  this.fromCal = initCalendar();
  this.toCal = initCalendar();
  this._onclick = this.onclick.bind(this);
  event.bind(el, 'click', this._onclick);
}

/**
 * Mixin emitter.
 */

Emitter(Rangepicker.prototype);

/**
 * Destory the picker element
 */

Rangepicker.prototype.remove = function() {
  event.unbind(this.trigger, 'click', this._onclick);
  o(this.trigger).remove();
};

/**
 * Handle input clicks.
 */

Rangepicker.prototype.onclick = function(e){
  if (this.tip) return;
  var b = this.body.find('.rangepicker-body');
  b.append(this.fromCal.el);
  b.append(this.toCal.el);
  var dates = this.getValue();
  if (dates && dates.length === 2) {
    this.fromCal.select(new Date(dates[0]));
    this.toCal.select(new Date(dates[1]));
  }
  this.tip = new Tip(this.body, {
    delay: 300
  });
  this.tip.position('east', {
      auto: false
    })
  this.tip.classname = 'rangepicker-tip tip';
  this.tip.show(this.trigger);
  var h = this.body.find('.rangepicker-body').height();
  this.body.find('.rangepicker-actions').height(h);
  this._oncancel = this.oncancel.bind(this);
  this._onok = this.onok.bind(this);
  this._ondocumentclick = this.ondocumentclick.bind(this);
  this._onkeydown = this.onkeydown.bind(this);
  o(document).on('click', this._ondocumentclick);
  o(document).on('keydown', this._onkeydown);
  this.body.find('.cancel').on('click', this._oncancel);
  this.body.find('.ok').on('click', this._onok);
};

Rangepicker.prototype.onkeydown = function(e) {
  if (e.keyCode === 27){
    this.oncancel();
  }
}

Rangepicker.prototype.ondocumentclick = function(e) {
  var target = o(e.target);
  if (o(e.target).parents('.rangepicker-tip').addBack().hasClass('rangepicker-tip')) {
    return;
  }
  if (o(e.target).is(this.trigger)) {
    return;
  }
  this.oncancel();
}

Rangepicker.prototype.onok = function(e){
  var fd = this.fromCal.getDateString();
  var td = this.toCal.getDateString();
  var revert = this.fromCal._date.getTime() > this.toCal._date.getTime()? true:false;
  if (revert) {
    this.trigger.value = td + '-' + fd;
  } else {
    this.trigger.value = fd + '-' + td;
  }
  var value = this.getValue();
  this.emit('change', value);
  this.oncancel();
};

Rangepicker.prototype.oncancel = function(){
  if (this.tip) {
    o(document).off('click', this._ondocumentclick);
    o(document).off('keydown', this._onkeydown);
    this.body.find('.cancel').off('click', this._oncancel);
    this.body.find('.ok').off('click', this._onok);
    this.tip.remove();
    this.tip = null;
  }
};

Rangepicker.prototype.getValue = function() {
  var str = this.trigger.value;
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

/**
 * Expose `Rangepicker`.
 */

module.exports = Rangepicker;
