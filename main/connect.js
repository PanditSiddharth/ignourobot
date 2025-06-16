const mongoose = require('mongoose');
const config = require('./config')
let cachedConnection = null;

const connect = async () => {
  if (cachedConnection) {
    console.log('Using cached database connection');
    return cachedConnection;
  }

  try {
    const conn = await mongoose.connect(config.mongoUri);
     cachedConnection = conn;
    console.log('New database connection established');
    return conn;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

module.exports = connect