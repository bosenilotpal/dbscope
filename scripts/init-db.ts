import { users, generateId } from '../src/lib/db/sqlite.js';
import { hashPassword } from '../src/lib/auth/session.js';

async function initializeDatabase() {
    console.log('🔧 Initializing database...');

    try {
        // Check if admin user already exists
        const existingAdmin = users.getByUsername('admin');

        if (existingAdmin) {
            console.log('✅ Admin user already exists');
            return;
        }

        // Create default admin user
        const defaultPassword = 'admin';
        const passwordHash = await hashPassword(defaultPassword);

        users.create({
            username: 'admin',
            passwordHash,
            email: 'admin@dbscope.local',
        });

        console.log('✅ Created default admin user');
        console.log('   Username: admin');
        console.log('   Password: admin');
        console.log('   ⚠️  Please change the password after first login!');
    } catch (error) {
        console.error('❌ Error initializing database:', error);
        process.exit(1);
    }
}

initializeDatabase();
