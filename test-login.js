const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const testLogin = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB Connected');

        // Find admin user
        const adminUser = await User.findOne({ email: 'admin@canvascartel.in' }).select('+password');

        if (!adminUser) {
            console.log('❌ Admin user not found');
            process.exit(1);
        }

        console.log('✅ Admin user found:');
        console.log('   ID:', adminUser._id);
        console.log('   Name:', adminUser.name);
        console.log('   Email:', adminUser.email);
        console.log('   Role:', adminUser.role);
        console.log('   Password hash:', adminUser.password.substring(0, 20) + '...');

        // Test password match
        const isMatch = await adminUser.matchPassword('admin123');
        console.log('\n🔐 Password match test:');
        console.log('   Password "admin123" matches:', isMatch);

        if (isMatch) {
            console.log('\n✅ Login should work correctly!');
        } else {
            console.log('\n❌ Password does not match - need to re-seed');
            // Re-create user with correct password
            await User.deleteOne({ email: 'admin@canvascartel.in' });
            const newUser = await User.create({
                name: 'Canvas Cartel Admin',
                email: 'admin@canvascartel.in',
                password: 'admin123',
                role: 'admin',
            });
            console.log('✅ User re-created with fresh password hash');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

testLogin();
