// Demo Setup Script for Q-Tech (Node.js version for cross-platform)
// This script sets up the system with demo data for portfolio showcase

require('dotenv').config({ path: './backend/.env' });
const { query } = require('./backend/config/database');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m',
};

async function setupDemo() {
  try {
    console.log(`${colors.green}🎬 Setting up Q-Tech Demo Environment${colors.reset}\n`);

    // Check database connection
    console.log(`${colors.yellow}📊 Checking database connection...${colors.reset}`);
    await query('SELECT NOW()');
    console.log(`${colors.green}✅ Database connected${colors.reset}\n`);

    // Generate password hash for demo accounts
    console.log(`${colors.yellow}🔐 Generating password hashes...${colors.reset}`);
    const demoPasswordHash = await bcrypt.hash('demo123', 10);
    console.log(`${colors.green}✅ Password hash generated${colors.reset}\n`);

    // Read and execute migrations
    console.log(`${colors.yellow}🗄️  Running database migrations...${colors.reset}`);
    const migrationsDir = path.join(__dirname, 'database', 'migrations');
    const migrationFiles = [
      '001_initial_schema.sql',
      '002_create_system_settings.sql',
      '003_add_queue_prefix_to_services.sql',
      '004_add_performance_indexes.sql',
    ];

    for (const file of migrationFiles) {
      const filePath = path.join(migrationsDir, file);
      if (fs.existsSync(filePath)) {
        console.log(`  Running ${file}...`);
        const sql = fs.readFileSync(filePath, 'utf8');
        try {
          await query(sql);
          console.log(`  ✅ ${file} completed`);
        } catch (error) {
          if (error.message.includes('already exists') || error.message.includes('duplicate')) {
            console.log(`  ⚠️  ${file} - may have already been run`);
          } else {
            throw error;
          }
        }
      }
    }

    // Seed demo data
    console.log(`\n${colors.yellow}🌱 Seeding demo data...${colors.reset}`);
    const seedFile = path.join(__dirname, 'database', 'seeds', 'demo-data.sql');
    
    if (!fs.existsSync(seedFile)) {
      throw new Error('Demo data file not found');
    }

    let seedSQL = fs.readFileSync(seedFile, 'utf8');
    
    // Replace placeholder hash with actual hash
    seedSQL = seedSQL.replace(
      /\$2b\$10\$rQ8K8K8K8K8K8K8K8K8K8uK8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K/g,
      demoPasswordHash
    );

    // Execute seed SQL
    await query(seedSQL);

    // Get summary
    const userCount = await query('SELECT COUNT(*) as count FROM users');
    const serviceCount = await query('SELECT COUNT(*) as count FROM services');
    const counterCount = await query('SELECT COUNT(*) as count FROM counters');
    const queueCount = await query('SELECT COUNT(*) as count FROM queue_entries');

    console.log(`\n${colors.green}✅ Demo setup completed!${colors.reset}\n`);
    console.log('Summary:');
    console.log(`  - Users: ${userCount.rows[0].count}`);
    console.log(`  - Services: ${serviceCount.rows[0].count}`);
    console.log(`  - Counters: ${counterCount.rows[0].count}`);
    console.log(`  - Queue Entries: ${queueCount.rows[0].count}`);
    console.log(`\n${colors.green}Demo credentials:${colors.reset}`);
    console.log('  Admin: admin@clsu.edu.ph / demo123');
    console.log('  Staff: staff1@clsu.edu.ph / demo123');
    console.log('  Student: student1@clsu.edu.ph / demo123');
    console.log(`\nYou can now start the server:`);
    console.log(`  cd backend && npm run dev`);

  } catch (error) {
    console.error(`\n${colors.red}❌ Error:${colors.reset}`, error.message);
    console.error('\nPlease check:');
    console.error('  1. Database is running');
    console.error('  2. Database credentials in backend/.env are correct');
    console.error('  3. Database exists');
    process.exit(1);
  }
}

setupDemo();

