const { MongoClient, ObjectId } = require('mongodb');
const multer = require('multer');

const dbUri = 'mongodb+srv://Vlad:123@cluster.66iafdi.mongodb.net/';
const dbName = 'GuitarKZ';

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/items_pictures/');
  },
  filename: (req, file, cb) => {
    const originalName = file.originalname.split('.').slice(0, -1).join('');
    cb(null, originalName);
  },
});
const upload = multer({ storage });

// Функция для подключения к базе данных
const connectToDb = async () => {
  const client = await MongoClient.connect(dbUri);
  const db = client.db(dbName);
  return { client, db };
};

module.exports = { connectToDb, ObjectId, upload };