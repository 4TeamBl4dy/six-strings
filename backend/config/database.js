const { MongoClient, ObjectId } = require('mongodb');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const dbUri = 'mongodb+srv://Vlad:123@cluster.66iafdi.mongodb.net/';
const dbName = 'GuitarKZ';

const uploadDir = '../../public/items_pictures/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = file.originalname
      .split('.')
      .slice(0, -1)
      .join('')
      .replace(/[^a-zA-Z0-9-_]/g, '_')
      .toLowerCase();
    const uniqueName = `${name}_${Date.now()}${ext}`;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

const connectToDb = async () => {
  const client = await MongoClient.connect(dbUri);
  const db = client.db(dbName);
  return { client, db };
};

module.exports = { connectToDb, ObjectId, upload };