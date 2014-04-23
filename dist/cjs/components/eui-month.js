"use strict";
var DATE_SLOT_HBS, containsDate, forEachSlot, month;

DATE_SLOT_HBS = Handlebars.compile('<li class="{{classNames}}" data-date="{{jsonDate}}">' + '{{date}}' + '</li>');

containsDate = function(dates, date) {
  if (!dates || !Em.get(dates, 'length')) {
    return false;
  }
  return dates.any(function(d) {
    return date.isSame(d, 'day');
  });
};

forEachSlot = function(month, iter) {
  var currentDay, day, firstDay, popCurrentDay, totalDays, week, _i, _j, _results;
  totalDays = month.daysInMonth();
  firstDay = month.clone().startOf('month').weekday();
  currentDay = 1;
  popCurrentDay = function() {
    if (currentDay > totalDays) {
      return null;
    } else {
      return moment([month.year(), month.month(), currentDay++]);
    }
  };
  _results = [];
  for (week = _i = 0; _i <= 6; week = ++_i) {
    for (day = _j = 0; _j <= 6; day = ++_j) {
      if (week === 0) {
        iter(day < firstDay ? null : popCurrentDay());
      } else {
        iter(currentDay <= totalDays ? popCurrentDay() : null);
      }
    }
    if (currentDay > totalDays) {
      break;
    } else {
      _results.push(void 0);
    }
  }
  return _results;
};

month = Em.Component.extend({
  tagName: 'ol',
  classNames: 'eui-month',
  month: null,
  selectedDates: null,
  disabledDates: null,
  init: function() {
    this._super();
    if (!this.get('selectedDates')) {
      throw 'you must provide selectedDates to eui-month';
    }
  },
  click: function(event) {
    var $target;
    $target = $(event.target);
    if ($target.is('.eui-disabled')) {
      return;
    }
    if ($target.is('[data-date]')) {
      return this.sendAction('select', moment($target.data('date'), 'YYYY-MM-DD'));
    }
  },
  monthDidChange: (function() {
    return Em.run.scheduleOnce('afterRender', this, 'rerender');
  }).observes('month'),
  selectedDatesDidChange: (function() {
    return Em.run.scheduleOnce('afterRender', this, 'setSelectedDates');
  }).observes('selectedDates.@each'),
  setSelectedDates: function() {
    var date, dates, json, view, _i, _len, _results;
    dates = this.get('selectedDates');
    view = this;
    json;
    if (this.state === !'inDOM') {
      return;
    }
    this.$('li').removeClass('eui-selected');
    _results = [];
    for (_i = 0, _len = dates.length; _i < _len; _i++) {
      date = dates[_i];
      json = date.format('YYYY-MM-DD');
      _results.push(view.$('[data-date="' + json + '"]').addClass('eui-selected'));
    }
    return _results;
  },
  didInsertElement: function() {
    return this.setSelectedDates();
  },
  render: function(buff) {
    var renderSlot, view;
    month = this.get('month');
    view = this;
    if (!month) {
      return;
    }
    renderSlot = function(slot) {
      attrs;
      var attrs;
      if (slot) {
        attrs = {
          date: slot.format('D'),
          jsonDate: slot.format('YYYY-MM-DD'),
          classNames: ['eui-slot', 'eui-day']
        };
        view.applyOptionsForDate(attrs, slot);
        attrs.classNames = attrs.classNames.join(' ');
        return buff.push(DATE_SLOT_HBS(attrs));
      } else {
        return buff.push('<li class="eui-slot eui-empty"></li>');
      }
    };
    return forEachSlot(month, function(slot) {
      return renderSlot(slot);
    });
  },
  applyOptionsForDate: function(options, date) {
    var disabledDates, selectedDates;
    disabledDates = this.get('disabledDates');
    selectedDates = this.get('selectedDates');
    if (moment().isSame(date, 'day')) {
      options.classNames.push('eui-today');
    }
    if (disabledDates && containsDate(disabledDates, date)) {
      options.classNames.push('eui-disabled');
    }
    if (selectedDates && containsDate(selectedDates, date)) {
      return options.classNames.push('eui-selected');
    }
  }
});

exports["default"] = month;