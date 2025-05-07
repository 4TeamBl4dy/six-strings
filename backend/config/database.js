const { MongoClient, ObjectId } = require('mongodb');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// MongoDB configuration
const dbUri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME;

// Отладка: проверить, какие переменные загружены

// Проверка наличия переменных окружения
if (!dbUri || !dbName) {
  throw new Error('MONGODB_URI or MONGODB_DB_NAME is not defined in .env');
}

const connectToDb = async () => {
  try {
    const client = await MongoClient.connect(dbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const db = client.db(dbName);
    return { client, db };
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
};

module.exports = { connectToDb, ObjectId };