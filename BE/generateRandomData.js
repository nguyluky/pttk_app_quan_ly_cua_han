require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/userModel');
const { ObjectId } = mongoose.Types;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/posapp')
    .then(() => console.log('MongoDB Connected'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

// Generate random string for unique emails
const randomString = () => Math.random().toString(36).substring(2, 8);

// Generate random phone number
const generateRandomPhone = () => {
    return `0${Math.floor(Math.random() * 999999999) + 9000000000}`.substring(0, 10);
};

// Create a sample store ID (this should be a valid store ID from your database)
const sampleStoreId = new ObjectId();

// Array of admin data
const adminUsers = [
    {
        name: 'Admin User 1',
        email: `admin1_${randomString()}@example.com`,
        password: 'admin123',
        phone: generateRandomPhone(),
        role: 'admin',
        storeId: sampleStoreId,
        isActive: true
    },
    {
        name: 'Admin User 2',
        email: `admin2_${randomString()}@example.com`,
        password: 'admin123',
        phone: generateRandomPhone(),
        role: 'admin',
        storeId: sampleStoreId,
        isActive: true
    },
    {
        name: 'Admin User 3',
        email: `admin3_${randomString()}@example.com`,
        password: 'admin123',
        phone: generateRandomPhone(),
        role: 'admin',
        storeId: sampleStoreId,
        isActive: true
    }
];

// Decide how many admin users to create (2-3)
const numberOfAdmins = Math.floor(Math.random() * 2) + 2; // Random number between 2 and 3
const selectedAdmins = adminUsers.slice(0, numberOfAdmins);

// get all
User.find({
    email: "admin1_9t7mn6@example.com"
}).select('+password')
    .then(users => {
        console.log('All users:', users);
    })
    .catch(err => {
        console.error('Error fetching users:', err);
    });

// Insert admin users into database
const insertAdmins = async () => {
    try {
        const createdUsers = await User.create(selectedAdmins);

        console.log(`Successfully created ${createdUsers.length} admin users:`);
        createdUsers.forEach(user => {
            console.log(`- ${user.name} (${user.email})`);
        });

        // Close the connection
        mongoose.connection.close();
    } catch (error) {
        console.error('Error creating admin users:', error);
        mongoose.connection.close();
    }
};

// Run the function
insertAdmins();
