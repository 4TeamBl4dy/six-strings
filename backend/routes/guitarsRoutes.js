const express = require('express');
const router = express.Router();
const { connectToDb, ObjectId } = require('../config/database');
const { s3Client, upload } = require('../config/r2');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
require('dotenv').config();

router.get('/guitars', async (req, res) => {
  try {
    const { client, db } = await connectToDb();
    const guitars = db.collection('Guitars');

    const data = await guitars.find({}).toArray();

    client.close();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/guitars', upload.single('img'), async (req, res) => {
  try {
    const { name, description, cost, amount, type, brand, sellerLogin, userName, userPhone } = req.body;
    const img = req.file;

    if (!img || !name || !description || !cost || !amount || !type || !brand || !sellerLogin || !userName || !userPhone) {
      return res.status(400).json({ error: 'Все поля обязательны' });
    }

    const fileName = `${Date.now()}-${img.originalname}`;
    const uploadParams = {
      Bucket: process.env.R2_BUCKET_NAME,
      Key: fileName,
      Body: img.buffer,
      ContentType: img.mimetype,
      ACL: 'public-read',
    };

    await s3Client.send(new PutObjectCommand(uploadParams));

    const imgUrl = `${process.env.R2_PUBLIC_URL}/${fileName}`;

    const newGuitar = {
      img: imgUrl,
      name,
      description,
      cost: parseFloat(cost),
      amount: parseInt(amount, 10),
      type,
      brand,
      seller: {
        login: sellerLogin,
        name: userName,
        phone: userPhone,
      },
    };

    const { client, db } = await connectToDb();
    const guitars = db.collection('Guitars');
    const result = await guitars.insertOne(newGuitar);

    client.close();
    res.json({ ...newGuitar, _id: result.insertedId });
  } catch (error) {
    console.error('Ошибка при загрузке в R2:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

router.put('/guitars/:id', upload.single('img'), async (req, res) => {
  try {
    const guitarId = req.params.id;
    const { name, description, cost, amount, type, brand, sellerLogin, userName, userPhone } = req.body;
    let imgUrl = req.body.img;

    if (req.file) {
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
    }
    
    const updatedGuitar = {
      img: imgUrl,
      name,
      description,
      cost: parseFloat(cost),
      amount: parseInt(amount, 10),
      type,
      brand,
      seller: {
        login: sellerLogin,
        name: userName,
        phone: userPhone,
      },
    };

    const { client, db } = await connectToDb();
    const guitars = db.collection('Guitars');
    const result = await guitars.updateOne(
      { _id: new ObjectId(guitarId) },
      { $set: updatedGuitar }
    );

    if (result.matchedCount === 0) {
      client.close();
      return res.status(404).json({ error: 'Товар не найден' });
    }

    client.close();
    res.json(updatedGuitar);
  } catch (error) {
    console.error('Ошибка при обновлении в R2:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

router.delete('/guitars/:id', async (req, res) => {
  try {
    const guitarId = req.params.id;
    const { client, db } = await connectToDb();
    const guitars = db.collection('Guitars');
    const result = await guitars.deleteOne({ _id: new ObjectId(guitarId) });

    if (result.deletedCount === 0) {
      client.close();
      return res.status(404).json({ error: 'Товар не найден' });
    }

    client.close();
    res.json({ message: 'Гитара удалена' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/guitars/popular', async (req, res) => {
  try {
    const { client, db } = await connectToDb();
    const guitars = db.collection('Guitars');
    const favorites = db.collection('Favorites');

    const allGuitars = await guitars.find({}).toArray();

    // Считаем количество добавлений в избранное для каждой гитары
    const favoriteCounts = await favorites.aggregate([
      {
        $group: {
          _id: "$guitar_id",
          count: { $sum: 1 }
        }
      }
    ]).toArray();

    const favoriteMap = favoriteCounts.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    // Добавляем поле popularity к каждой гитаре и сортируем
    const guitarsWithPopularity = allGuitars.map(guitar => ({
      ...guitar,
      popularity: favoriteMap[guitar._id.toString()] || 0
    })).sort((a, b) => b.popularity - a.popularity);

    // Возвращаем первые 15 самых популярных
    const topGuitars = guitarsWithPopularity.slice(0, 15);

    client.close();
    res.json(topGuitars);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;