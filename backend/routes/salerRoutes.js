const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { connectToDb, ObjectId } = require('../config/database');
const { s3Client, upload } = require('../config/r2');
const { PutObjectCommand } = require('@aws-sdk/client-s3');

const SALT_ROUNDS = 10;

// Middleware для проверки токена
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, 'access_token', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

router.post('/login_saler', async (req, res) => {
  const { login, password } = req.body;

  try {
    const { client, db } = await connectToDb();
    const salers = db.collection('Salers');

    const saler = await salers.findOne({ login });

    if (!saler) {
      client.close();
      return res.status(401).json({ error: 'Пользователь с таким логином не найден' });
    }

    const passwordMatch = await bcrypt.compare(password, saler.password);

    if (!passwordMatch) {
      client.close();
      return res.status(402).json({ error: 'Неверный пароль' });
    }

    const token = jwt.sign({ _id: saler._id, login: saler.login, name: saler.name, phone: saler.phone }, "access_token");

    client.close();
    res.json({ token, name: saler.name, phone: saler.phone });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/register_saler', async (req, res) => {
  const { login, password, name, phone } = req.body;

  try {
    const { client, db } = await connectToDb();
    const salers = db.collection('Salers');

    const existingSaler = await salers.findOne({ login });

    if (existingSaler) {
      client.close();
      return res.status(401).json({ error: 'Пользователь с таким логином уже зарегистрирован' });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const result = await salers.insertOne({ login, password: hashedPassword, name, phone, img: '' });

    const token = jwt.sign({ _id: result.insertedId, login, name, phone, img: '' }, "access_token");

    client.close();
    res.json({ token, name, phone });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/saler', authenticateToken, async (req, res) => {
  try {
    const { client, db } = await connectToDb();
    const salers = db.collection('Salers');

    const saler = await salers.findOne({ _id: new ObjectId(req.user._id) });

    if (!saler) {
      client.close();
      return res.status(404).json({ error: 'Saler not found' });
    }

    client.close();
    res.json({
      login: saler.login,
      phone: saler.phone,
      name: saler.name,
      img: saler.img || '',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.put('/saler', authenticateToken, upload.single('img'), async (req, res) => {
  try {
    const { login, name, phone, password } = req.body;
    let imgUrl = req.body.img;

    // Проверка уникальности логина, если он передан и отличается от текущего
    if (login && login !== req.user.login) {
      const { client: checkClient, db: checkDb } = await connectToDb();
      const salers = checkDb.collection('Salers');
      const existingSaler = await salers.findOne({ login });
      checkClient.close();
      if (existingSaler) {
        return res.status(409).json({ error: 'Логин уже занят другим пользователем.', details: 'Login already exists' });
      }
    }

    // Загрузка новой аватарки, если файл передан
    if (req.file) {
      console.log('Uploading file to R2:', req.file.originalname);
      const fileName = `${Date.now()}-${req.file.originalname}`;
      const uploadParams = {
        Bucket: process.env.R2_BUCKET_NAME,
        Key: fileName,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
        ACL: 'public-read',
      };

      await s3Client.send(new PutObjectCommand(uploadParams));
      imgUrl = `${process.env.R2_PUBLIC_URL}/${fileName}`;
      console.log('File uploaded to R2:', imgUrl);
    }

    // Формируем объект для обновления только с изменёнными полями
    const updatedFields = {};
    if (login && login !== req.user.login) updatedFields.login = login;
    if (name !== undefined) updatedFields.name = name || '';
    if (phone) updatedFields.phone = phone;
    if (imgUrl) updatedFields.img = imgUrl;
    if (password) {
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      updatedFields.password = hashedPassword;
    }

    // Если нет изменений, возвращаем текущие данные
    if (Object.keys(updatedFields).length === 0) {
      const { client, db } = await connectToDb();
      const salers = db.collection('Salers');
      const currentSaler = await salers.findOne({ _id: new ObjectId(req.user._id) });
      client.close();
      return res.json({
        login: currentSaler.login,
        name: currentSaler.name,
        phone: currentSaler.phone,
        img: currentSaler.img || '',
      });
    }

    const { client, db } = await connectToDb();
    const salers = db.collection('Salers');
    const result = await salers.updateOne(
      { _id: new ObjectId(req.user._id) },
      { $set: updatedFields }
    );

    if (result.matchedCount === 0) {
      client.close();
      return res.status(404).json({ error: 'Saler not found' });
    }

    // Получаем обновлённые данные
    const updatedSaler = await salers.findOne({ _id: new ObjectId(req.user._id) });

    // Обновляем токен, если логин изменился
    if (login && login !== req.user.login) {
      const newToken = jwt.sign({ _id: req.user._id, login, name: updatedSaler.name, phone: updatedSaler.phone }, "access_token");
      res.setHeader('Authorization', `Bearer ${newToken}`);
    }

    client.close();
    res.json({
      login: updatedSaler.login,
      name: updatedSaler.name,
      phone: updatedSaler.phone,
      img: updatedSaler.img || '',
    });
  } catch (error) {
    console.error('Ошибка при обновлении профиля продавца:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

module.exports = router;