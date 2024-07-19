const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const medicineSchema = new Schema({
    name: { type: String, required: true },
    times: [{ type: String, required: true }]
});

const reminderSchema = new Schema({
    email: { type: String, required: true, unique: true },
    medicines: [medicineSchema]
});

module.exports = mongoose.model('MedicineReminder', reminderSchema);
