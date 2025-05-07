const { S3Client } = require('@aws-sdk/client-s3');
const multer = require('multer');
require('dotenv').config();

// Настройка S3-клиента для Cloudflare R2
const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

// Настройка хранилища для multer
const storage = multer.memoryStorage();
const upload = multer({ storage });

module.exports = { s3Client, upload };