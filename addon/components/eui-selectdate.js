import Ember from 'ember';
import disabledSupport from '../mixins/disabled-support';
import widthSupport from '../mixins/width-support';
import errorSupport from '../mixins/error-support';
import popcalComponent from '../components/eui-popcal';

export default Ember.Component.extend(disabledSupport, errorSupport, widthSupport, {
  classNameBindings: ['isDisabled:eui-disabled', 'class'],
  tagName: 'eui-selectdate',

  baseClass: 'select',
  style: 'default',
  size: 'medium',
  calendarStyle: 'default',
  onChange: null,

  showPopcal: false,

  dateRange: false,

  selectClass: Ember.computed('size', 'style', function() {
    const baseClass = this.get('baseClass');
    const size = this.get('size');
    const style = this.get('style');
    return `eui-${baseClass}-button-${size}-${style}`;
  }),

  // Settings used when formatting the date
  formatting: {
    yearFormat: "YYYY",
    monthFormat: "MMMM",
    dayFormat: "D"
  },

  // Return Unix Time stamp of selections
  value: Ember.computed('selection.@each', {
    get(key) {
      const selection = this.get('selection');
      if (!selection) {
        if (this.get('dateRange')) {
          return [];
        } else {
          return null;
        }
      }

      if (Ember.isArray(selection)) {
        return selection.map((date) => {
          return date.format('X');
        });
      } else {
        return selection.format('X');
      }
    },

    set(key, value) {
      const selection = this.get('selection');

      if (!value) {
        this.set('selection', value);
        return value;
      }

      if (Ember.isArray(value)) {
        this.set('selection', value.map((v) => {
          return moment(v);
        }));
      } else {
        this.set('selection', moment(value));
      }

      return value;
    }
  }),

  // Make sure if a selection is passed in that we immediately calculate what the
  // value is
  calculateInitalValue: Ember.on('didInsertElement', function() {
    return this.notifyPropertyChange('value');
  }),

  // We have to calculate if there is no selection manually because [] will
  // evaluate to true and prevent a multi select from adding the placeholder
  // class
  isPlaceholder: Ember.computed('selection', function() {
    const selection = this.get('selection');
    return (!selection || (Ember.isArray(selection) && selection.length === 0));
  }),

  actions: {
    openCalendar() {
      return this.toggleProperty('showPopcal');
    },

    onSelectionChange(selection) {
      return this.sendAction('onChange', selection);
    }
  },

  keyUp: function(event) {
    // Down Arrow
    if (event.which === 40) {
      event.preventDefault();
      this.set('showPopcal', true);
    }
  },

  label: Ember.computed('selection.@each', 'placeholder', function() {
    const selection = this.get('selection');
    let label = null;

    if (!selection) {
      return this.get('placeholder');
    }

    if (Ember.isArray(selection)) {
      if (selection.length < 2) {
        const startDate = selection[0];
        label = this.formatDateRange(startDate);
      } else {
        const startDate = selection[0];
        const endDate = selection[selection.length - 1];
        label = this.formatDateRange(startDate, endDate);
      }
    } else {
      label = this.formatDate(selection);
    }

    return label;
  }),

  formatDate: function(date) {
    if (!date) {
      return;
    }

    return date.twix(date, true).format(this.get('formatting'));
  },

  formatDateRange: function(startDate, endDate) {
    if (!startDate) {
      return;
    }

    const formatting = this.get('formatting');

    // No end date is selected so show partial date
    if (!endDate) {
      return startDate.twix(startDate, true).format(formatting) + ' -';
    }

    // Full date range
    if (startDate && endDate) {
      if (endDate.isBefore(startDate)) {
        return endDate.twix(startDate, true).format(formatting);
      } else {
        return startDate.twix(endDate, true).format(formatting);
      }
    }
  },

  // Error check should happen without user having to focus on component
  isEntered: true
});
