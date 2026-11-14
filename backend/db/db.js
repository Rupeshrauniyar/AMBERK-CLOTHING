const mongoose = require('mongoose');
const dns = require('dns');

// On Windows or environments with local DNS issues resolving Mongo SRV records, fall back to public DNS
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  console.warn('DNS server configuration fallback warning:', e.message);
}

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URL;
    if (!mongoUri) {
      throw new Error('MONGODB_URL environment variable is missing.');
    }

    const conn = await mongoose.connect(mongoUri, {
      dbName: process.env.DB_NAME || 'amberk',
    });

    console.log(`[Database] MongoDB Connected: ${conn.connection.host} / ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[Database Error] Connection failed: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;

