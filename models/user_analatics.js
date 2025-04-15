const mongoose = require('mongoose');

// For storing detailed period data
const PeriodsDatesSchema = new mongoose.Schema(
  {
    user: {
      type: String,
      required: true,
    },
    periods_start: {
      type: String,
      required: true,
    },
    periods_end: {
      type: String,
      default: null,
    },
    period_month: {
      type: Number,
      required: true,
    },
    period_year: {
      type: Number,
      required: true,
    },
    // Add fields for tracking moods and flow levels
    moods: [{
      date: {
        type: String,
        required: true
      },
      note: {
        type: String,
        required: true
      }
    }],
    bleeding_levels: [{
      date: {
        type: String,
        required: true
      },
      level: {
        type: String,
        enum: ['heavy', 'medium', 'low'],
        required: true
      }
    }]
  },
  { timestamps: true }
);

// For calendar view
const PeriodsMonthlySchema = new mongoose.Schema(
  {
    period_dates: {
      type: String, 
      required: true,
    },
    period_month: {
      type: String,
      required: true,
    },
    period_year: {
      type: String,
      required: true,
    },
    user: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const PeriodsDates = mongoose.model("periodesDates", PeriodsDatesSchema);
const PeriodsMonthly = mongoose.model("periodmonthly", PeriodsMonthlySchema);

module.exports = { PeriodsDates, PeriodsMonthly };