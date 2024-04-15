// app.js

const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const session = require('express-session');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'your_secret_key',
    resave: true,
    saveUninitialized: true
}));

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/fitclub', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB:', err));

// Define Mongoose schema and models
const UserSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

const SubscriptionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    plan: { type: String, enum: ['1month', '6month', '12month'], required: true }
});

const User = mongoose.model('User', UserSchema);
const Subscription = mongoose.model('Subscription', SubscriptionSchema);

// User registration route
app.post('/register', async (req, res) => {
    const { firstName, email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ firstName, email, password: hashedPassword });
        await user.save();
        res.status(201).send('User registered successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error registering user');
    }
});

// Subscription purchase route
app.post('/purchase', async (req, res) => {
    const { userId, plan } = req.body;

    try {
        const subscription = new Subscription({ userId, plan });
        await subscription.save();
        res.status(201).send('Subscription purchased successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error purchasing subscription');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));