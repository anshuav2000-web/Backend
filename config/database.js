const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI;

        if (!mongoURI) {
            throw new Error('MONGODB_URI environment variable is not defined');
        }

        console.log('Attempting to connect to MongoDB Atlas...');

        const conn = await mongoose.connect(mongoURI);

        console.log(`✅ MongoDB Connected Successfully!`);
        console.log(`   Host: ${conn.connection.host}`);
        console.log(`   Database: ${conn.connection.name}`);
        console.log(`   Ready State: ${conn.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);

        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB Connection Error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('⚠️ MongoDB Disconnected');
        });

        mongoose.connection.on('reconnected', () => {
            console.log('🔄 MongoDB Reconnected');
        });

        return conn;
    } catch (error) {
        console.error('❌ MongoDB Connection Failed!');
        console.error(`   Error Name: ${error.name}`);
        console.error(`   Error Message: ${error.message}`);

        if (error.name === 'MongoNetworkError') {
            console.error('   This might be due to network issues or IP whitelist restrictions.');
            console.error('   Please ensure your IP is whitelisted in MongoDB Atlas.');
        } else if (error.name === 'MongoParseError') {
            console.error('   Please check your MongoDB connection string format.');
        } else if (error.name === 'MongoServerSelectionError') {
            console.error('   Could not connect to any MongoDB server.');
            console.error('   Please check if the cluster is running and accessible.');
        }

        process.exit(1);
    }
};

module.exports = connectDB;