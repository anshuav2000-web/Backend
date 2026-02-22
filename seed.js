const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const seedDB = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/canvas-crm');
        console.log('✅ MongoDB Connected');

        // Clear existing users
        await User.deleteMany({});
        console.log('✅ Cleared existing users');

        // Create admin user
        const adminUser = await User.create({
            name: 'Canvas Cartel Admin',
            email: 'admin@canvascartel.in',
            password: 'admin123',
            role: 'admin',
        });

        console.log('✅ Admin user created:');
        console.log('   Email:', adminUser.email);
        console.log('   Password: admin123');
        console.log('   Role:', adminUser.role);

        // Create a regular user for testing
        const regularUser = await User.create({
            name: 'Test User',
            email: 'user@example.com',
            password: 'user123',
            role: 'user',
        });

        console.log('✅ Regular user created:');
        console.log('   Email:', regularUser.email);
        console.log('   Password: user123');
        console.log('   Role:', regularUser.role);

        console.log('\n🎉 Database seeded successfully!');
        console.log('\nYou can now login with these credentials:');
        console.log('   Admin: admin@canvascartel.in / admin123');
        console.log('   User: user@example.com / user123');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedDB();