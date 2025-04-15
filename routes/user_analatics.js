require("dotenv").config();
const express = require("express");
const router = express.Router();
const { Appoinments } = require("../models/appoinment");
const { Users, UserDetails } = require("../models/users");
const { PeriodsDates, PeriodsMonthly } = require("../models/user_analatics");

const mongoose = require("mongoose");
const isAuthenticated = require("../middlware/auth");
const isUserValidate = require("../middlware/user");

router.post(
  "/period-start",
  isAuthenticated,
  isUserValidate,
  async (req, res) => {
    try {
      const current_user = req.user["email"];
      const date = new Date();
      const current_month = date.getMonth();
      const current_year = date.getFullYear();
      const { start_date } = req.body;
      
      if (!start_date) {
        return res.status(400).json({ message: "Start Date is required" });
      }
      
      // Parse the start date into a Date object
      const startDate = new Date(start_date);
      const startMonth = startDate.getMonth();
      const startYear = startDate.getFullYear();
      
      // Check if a period already exists for this user in the current month
      const existingPeriod = await PeriodsDates.findOne({
        user: current_user,
        period_month: startMonth,
        period_year: startYear
      });
      
      if (existingPeriod) {
        // Update existing period with new start date
        existingPeriod.periods_start = start_date;
        // If no end date, set the end date to the start date initially
        if (!existingPeriod.periods_end) {
          existingPeriod.periods_end = start_date;
        }
        await existingPeriod.save();
        
        // Also update any existing monthly data
        await PeriodsMonthly.deleteMany({
          user: current_user,
          period_month: startMonth,
          period_year: startYear
        });
      } else {
        // Create a new period entry
        const newPeriods = new PeriodsDates({
          user: current_user,
          periods_start: start_date,
          periods_end: start_date, // Initially set end date same as start date
          period_month: startMonth,
          period_year: startYear
        });
        await newPeriods.save();
      }
      
      // Generate period_dates entry for the calendar view
      const newPeriodMonth = new PeriodsMonthly({
        period_dates: String([startDate.getDate()]), // Initial period is just the start date
        period_month: String(startMonth),
        period_year: String(startYear),
        user: current_user,
      });
      await newPeriodMonth.save();
      
      return res.status(200).json({ 
        message: "Period start date updated",
        start_date: start_date,
        month: startMonth,
        year: startYear
      });
    } catch (error) {
      console.log(error);
      return res.status(400).json({ message: error.message });
    }
  }
);

// Update existing period-end route to store the end date properly
router.post(
  "/period-end",
  isAuthenticated,
  isUserValidate,
  async (req, res) => {
    try {
      const current_user = req.user["email"];
      const { end_date } = req.body;
      
      if (!end_date) {
        return res.status(400).json({ message: "End date is required" });
      }
      
      // Find the most recent period entry for this user
      const period = await PeriodsDates.findOne({ 
        user: current_user 
      }).sort({ period_year: -1, period_month: -1, createdAt: -1 });
      
      if (!period) {
        return res.status(404).json({ message: "No period found to end" });
      }
      
      // Get start date and end date
      const startDate = new Date(period.periods_start);
      const endDate = new Date(end_date);
      
      // Validate that end date is after or equal to start date
      if (endDate < startDate) {
        return res.status(400).json({ message: "End date cannot be before start date" });
      }
      
      // Update the end date
      period.periods_end = end_date;
      await period.save();
      
      // Calculate all dates in between (inclusive)
      const allDates = [];
      const currentDate = new Date(startDate);
      
      while (currentDate <= endDate) {
        allDates.push(currentDate.getDate());
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      // Update the PeriodsMonthly collection with all dates
      const startMonth = startDate.getMonth();
      const startYear = startDate.getFullYear();
      
      // First check if a monthly entry exists
      const existingMonthly = await PeriodsMonthly.findOne({
        user: current_user,
        period_month: String(startMonth),
        period_year: String(startYear)
      });
      
      if (existingMonthly) {
        // Update existing entry with all dates
        existingMonthly.period_dates = String(allDates);
        await existingMonthly.save();
      } else {
        // Create new entry with all dates
        const newPeriodMonth = new PeriodsMonthly({
          period_dates: String(allDates),
          period_month: String(startMonth),
          period_year: String(startYear),
          user: current_user
        });
        await newPeriodMonth.save();
      }
      
      return res.status(200).json({ 
        message: "Period end date updated successfully",
        period_dates: allDates,
        start_date: period.periods_start,
        end_date: end_date
      });
    } catch (error) {
      console.log(error);
      return res.status(400).json({ message: error.message });
    }
  }
);

// Add a new route for saving mood data
router.post(
  "/add-mood",
  isAuthenticated,
  isUserValidate,
  async (req, res) => {
    try {
      const current_user = req.user["email"];
      const { mood, date } = req.body;
      
      if (!mood) {
        return res.status(400).json({ message: "Mood data is required" });
      }
      
      const moodData = {
        date: date || new Date().toISOString().split('T')[0],
        note: mood
      };
      
      // Find the most recent period entry for this user
      const periods = await PeriodsDates.findOne({ 
        user: current_user 
      }).sort({ period_year: -1, period_month: -1, createdAt: -1 });
      
      if (!periods) {
        return res.status(404).json({ message: "No period found to add mood" });
      }
      
      // Add the mood data to the period
      if (!periods.moods) {
        periods.moods = [];
      }
      
      periods.moods.push(moodData);
      console.log(`Adding mood to period - before save:`, JSON.stringify(periods.moods, null, 2));
      await periods.save();
      console.log(`Mood saved successfully - after save:`, JSON.stringify(periods.moods, null, 2));
      
      return res.status(200).json({ 
        message: "Mood data added successfully",
        mood: moodData
      });
    } catch (error) {
      console.log(error);
      return res.status(400).json({ message: error.message });
    }
  }
);

// Add a new route for saving bleeding level data
router.post(
  "/add-bleeding",
  isAuthenticated,
  isUserValidate,
  async (req, res) => {
    try {
      const current_user = req.user["email"];
      const { level, date } = req.body;
      
      if (!level || !['heavy', 'medium', 'low'].includes(level.toLowerCase())) {
        return res.status(400).json({ message: "Valid bleeding level is required (heavy, medium, or low)" });
      }
      
      const bleedingData = {
        date: date || new Date().toISOString().split('T')[0],
        level: level.toLowerCase()
      };
      
      // Find the most recent period entry for this user
      const periods = await PeriodsDates.findOne({ 
        user: current_user 
      }).sort({ period_year: -1, period_month: -1, createdAt: -1 });
      
      if (!periods) {
        return res.status(404).json({ message: "No period found to add bleeding level" });
      }
      
      // Add the bleeding level data to the period
      if (!periods.bleeding_levels) {
        periods.bleeding_levels = [];
      }
      
      periods.bleeding_levels.push(bleedingData);
      console.log(`Adding bleeding level to period - before save:`, JSON.stringify(periods.bleeding_levels, null, 2));
      await periods.save();
      console.log(`Bleeding level saved successfully - after save:`, JSON.stringify(periods.bleeding_levels, null, 2));
      
      return res.status(200).json({ 
        message: "Bleeding level data added successfully",
        bleeding: bleedingData
      });
    } catch (error) {
      console.log(error);
      return res.status(400).json({ message: error.message });
    }
  }
);

// Update getdata route to include comprehensive period information
router.get("/getdata", isAuthenticated, isUserValidate, async (req, res) => {
  try {
    const current_user = req.user["email"];
    
    // Find user details
    const userDetails = await UserDetails.findOne({ email: current_user });
    
    // Find all period data for this user, sorted by date
    const periodData = await PeriodsDates.find({ 
      user: current_user 
    }).sort({ period_year: -1, period_month: -1, periods_start: -1 });
    
    // Get all monthly period data for calendar visualization
    const periodsMonthly = await PeriodsMonthly.find({
      user: current_user,
    }).sort({ period_year: -1, period_month: -1 }).select("-__v -_id");
    
    // Prepare response data
    const responseData = {
      email: current_user,
      dob: userDetails ? userDetails.dob : null,
      last_period_start: periodData && periodData.length > 0 ? periodData[0].periods_start : null,
      last_cycle_regular: userDetails ? userDetails.last_cycle_regular : 28,
      duration_period: userDetails ? userDetails.duration_period : 5,
      conceive_true: userDetails ? userDetails.conceive_true : false,
      last_cycle_irregular: userDetails ? userDetails.last_cycle_irregular : false,
    };
    
    // Process period data for detailed response
    if (periodData && periodData.length > 0) {
      // Include full historical period data with moods and bleeding levels
      responseData.periods = periodData.map(period => {
        // Convert period dates string to array if needed
        let periodDatesArray = [];
        if (period.period_dates && typeof period.period_dates === 'string') {
          try {
            periodDatesArray = period.period_dates.split(',').map(d => parseInt(d.trim()));
          } catch (e) {
            console.log('Error parsing period dates:', e);
            periodDatesArray = [];
          }
        }
        
        // Calculate all dates in the period for calendar view
        const allDates = [];
        if (period.periods_start && period.periods_end) {
          const startDate = new Date(period.periods_start);
          const endDate = new Date(period.periods_end);
          const currentDate = new Date(startDate);
          
          while (currentDate <= endDate) {
            allDates.push(new Date(currentDate).toISOString().split('T')[0]);
            currentDate.setDate(currentDate.getDate() + 1);
          }
        }
        
        return {
          startDate: period.periods_start,
          endDate: period.periods_end,
          month: period.period_month,
          year: period.period_year,
          moods: period.moods || [],
          bleedingLevels: period.bleeding_levels || [],
          periodDates: periodDatesArray,
          allDates: allDates
        };
      });
      
      // Include the monthly period dates for calendar view
      responseData.period_dates = periodsMonthly;
      
      // Calculate historical analytics data
      if (responseData.periods.length > 1) {
        // Calculate average cycle length based on historical data
        let totalCycleDays = 0;
        let cycleCount = 0;
        
        for (let i = 0; i < responseData.periods.length - 1; i++) {
          const currentStart = new Date(responseData.periods[i].startDate);
          const prevStart = new Date(responseData.periods[i+1].startDate);
          
          if (currentStart && prevStart) {
            const cycleDays = Math.round((currentStart - prevStart) / (1000 * 60 * 60 * 24));
            if (cycleDays > 0 && cycleDays < 60) { // Filter out unrealistic values
              totalCycleDays += cycleDays;
              cycleCount++;
            }
          }
        }
        
        if (cycleCount > 0) {
          const calculatedCycleLength = Math.round(totalCycleDays / cycleCount);
          responseData.calculated_cycle_length = calculatedCycleLength;
          
          // Only update user data if it's significantly different
          if (!responseData.last_cycle_regular || 
              Math.abs(calculatedCycleLength - responseData.last_cycle_regular) > 3) {
            responseData.last_cycle_regular = calculatedCycleLength;
          }
        }
        
        // Calculate average period duration
        let totalPeriodDays = 0;
        let periodCount = 0;
        
        responseData.periods.forEach(period => {
          if (period.startDate && period.endDate) {
            const startDate = new Date(period.startDate);
            const endDate = new Date(period.endDate);
            const periodDays = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
            
            if (periodDays > 0 && periodDays < 15) { // Filter out unrealistic values
              totalPeriodDays += periodDays;
              periodCount++;
            }
          }
        });
        
        if (periodCount > 0) {
          const calculatedPeriodLength = Math.round(totalPeriodDays / periodCount);
          responseData.calculated_period_length = calculatedPeriodLength;
          
          // Only update user data if it's different
          if (!responseData.duration_period || 
              Math.abs(calculatedPeriodLength - responseData.duration_period) > 1) {
            responseData.duration_period = calculatedPeriodLength;
          }
        }
      }
    }
    
    // If we have cycle data stored in user details, include it
    if (userDetails && userDetails.cycle_data) {
      try {
        responseData.cycle_data = JSON.parse(userDetails.cycle_data);
      } catch (e) {
        console.log('Error parsing cycle data:', e);
      }
    }
    
    return res.status(200).json(responseData);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message || "Internal server error" });
  }
});

// New route to save cycle data
router.post(
  "/save-cycle-data",
  isAuthenticated,
  isUserValidate,
  async (req, res) => {
    try {
      const current_user = req.user["email"];
      const { cycleData } = req.body;
      
      if (!cycleData) {
        return res.status(400).json({ message: "Cycle data is required" });
      }
      
      // Find user's existing cycle data
      const existingCycleData = await UserDetails.findOne({ email: current_user });
      
      if (existingCycleData) {
        // Update existing user details
        existingCycleData.cycle_data = JSON.stringify(cycleData);
        await existingCycleData.save();
      } else {
        // Create new user details with cycle data
        const newUserDetails = new UserDetails({
          email: current_user,
          cycle_data: JSON.stringify(cycleData)
        });
        await newUserDetails.save();
      }
      
      return res.status(200).json({ 
        message: "Cycle data saved successfully",
        cycle_data: cycleData
      });
    } catch (error) {
      console.log(error);
      return res.status(400).json({ message: error.message });
    }
  }
);

// New route to get cycle data
router.get("/get-cycle-data", isAuthenticated, isUserValidate, async (req, res) => {
  try {
    const current_user = req.user["email"];
    
    // Find user's cycle data
    const userDetails = await UserDetails.findOne({ email: current_user });
    
    if (!userDetails || !userDetails.cycle_data) {
      return res.status(200).json({ 
        message: "No cycle data found",
        cycle_data: null
      });
    }
    
    // Parse the cycle data from JSON string
    const cycleData = JSON.parse(userDetails.cycle_data);
    
    return res.status(200).json({
      message: "Cycle data retrieved successfully",
      cycle_data: cycleData
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message || "Internal server error" });
  }
});

module.exports = router;
