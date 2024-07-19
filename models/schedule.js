const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Schedule Schema
const scheduleSchema = new Schema({
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    mobile: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    }
});

// Create the Schedule model
const Schedule = mongoose.model('Schedule', scheduleSchema);

module.exports = Schedule;
