import { connect as _connect } from 'mongoose';
import { mongoUri } from './config.js';
let cachedConnection = null;

const connect = async () => {
  if (cachedConnection) {
    console.log('Using cached database connection');
    return cachedConnection;
  }

  try {
    const conn = await _connect(mongoUri);
     cachedConnection = conn;
    console.log('New database connection established');
    return conn;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

export default connect