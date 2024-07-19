const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config();
const Schedule = require('./models/schedule');
const sendSMS = require('./sms');
const MedicineReminder = require('./models/reminder');

const app = express();
const port = 3000;

// Replace the following with your MongoDB connection string
const uri = process.env.mongoURI;

let db;

// Connect to MongoDB
MongoClient.connect(process.env.mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(client => {
        console.log('Connected to MongoDB');
        db = client.db('your_database_name'); // Replace with your database name
    })
    .catch(error => console.error(error));



app.use(express.json());


app.get('/', (req, res) => {
    res.send('Hello World!');
});

// Sign up route
app.post('/signup', async (req, res) => {
    try {
        const { name, email, password, mobile } = req.body;

        // Check if the user already exists
        const existingUser = await db.collection('users').findOne({ email }); // Use the appropriate collection name
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Create a new user
        const user = { name, email, password, mobile };
        await db.collection('users').insertOne(user); // Use the appropriate collection name

        res.status(201).json({ message: 'User created successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

//POST endpoint for login
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find the user by email
        const user = await db.collection('users').findOne({ email }); // Use the appropriate collection name
        if (!user) {
            return res.status(400).json({ error: 'User does not exist' });
        }

        // Check if the password matches
        if (user.password !== password) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // If login is successful
        res.status(200).json({ message: 'Login successful' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// POST endpoint to create a schedule
app.post('/createschedule', async (req, res) => {
    try {
        const { date, time, description, email } = req.body;

        const user = await db.collection('users').findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'User does not exist' });
        }

        console.log(user.mobile);

        const schedule = await db.collection('schedules').findOne({ email });
        if (schedule) {
            return res.status(400).json({ error: 'You can only book one appointment at a time' });
        }

        const mobile = user.mobile;

        // Create a new schedule entry
        const newSchedule = new Schedule({
            date,
            time,
            description,
            email,
            mobile
        });

        // Save the schedule to the database
        await db.collection('schedules').insertOne(newSchedule);

        sendSMS(mobile, `Schedule Created: DATE-${date} TIME-${time} for ${email}`);

        res.status(201).json({ message: 'Schedule created successfully', schedule: newSchedule });
    } catch (err) {
        res.status(400).json({ message: 'Error creating schedule', error: err.message });
    }
});


// GET endpoint to retrieve schedules
app.get('/getschedule/:email', async (req, res) => {
    const { email } = req.params;
    try {
        const schedules = await db.collection('schedules').findOne({ email });

        res.status(200).json(schedules);
    } catch (err) {
        res.status(500).json({ message: 'Error retrieving schedules', error: err.message });
    }
    console.log(req.params);
    console.log('this is emial', email);
});


// DELETE endpoint to delete the schedule
app.delete('/deleteschedule/:email', async (req, res) => {
    const { email } = req.params;
    console.log(email);
    try {
        const schedule = await db.collection('schedules').findOne({ email });
        if (!schedule) {
            return res.status(400).json({ error: 'Requested schedule does not exists' });
        }
        await db.collection('schedules').deleteOne({ email });
        res.status(200).json({ message: 'Successfully deleted the schedule!' })
    } catch (err) {
        res.status(500).json({ message: 'Error retrieving schedules', error: err.message });
    }
});

// POST request to create the reminder endpoint
app.post('/add-reminder', async (req, res) => {
    const { email, medicines } = req.body;

    if (!email || !medicines) {
        return res.status(400).json({ error: 'Email or medicine is missing' });
    }

    try {
        const newReminder = new MedicineReminder({ email, medicines });
        await db.collection('reminders').insertOne(newReminder);
        res.status(201).json({ message: 'Reminder added successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// DELETE endpoint to delete the schedule
app.delete('/delete-reminder/:email', async (req, res) => {
    const { email } = req.params;
    console.log(email);
    try {
        const reminder = await db.collection('reminders').findOne({ email });
        if (!reminder) {
            return res.status(400).json({ error: 'Requested reminder does not exists' });
        }
        await db.collection('reminders').deleteOne({ email });
        res.status(200).json({ message: 'Successfully deleted the reminder!' })
    } catch (err) {
        res.status(500).json({ message: 'Error retrieving reminders', error: err.message });
    }
});





app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
