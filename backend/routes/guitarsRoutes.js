const express = require('express');
const router = express.Router();
const { connectToDb, ObjectId, upload } = require('../config/database');

router.get('/guitars', async (req, res) => {
  try {
    const { client, db } = await connectToDb();
    const guitars = db.collection('Guitars');

    const data = await guitars.find({}).toArray();
    console.log('Отправленные гитары:', data); // Для отладки

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
    const img = req.file?.filename;

    console.log('POST данные:', { name, description, cost, amount, type, brand, sellerLogin, userName, userPhone, img }); // Для отладки

    if (!img || !name || !description || !cost || !amount || !type || !brand || !sellerLogin || !userName || !userPhone) {
      return res.status(400).json({ error: 'Все поля обязательны' });
    }

    const newGuitar = {
      img,
      name,
      description,
      cost: parseFloat(cost),
      amount: parseInt(amount, 10),
      type,
      brand,
      seller: {
        login: sellerLogin,
        name: userName,
        phone: userPhone
      }
    };

    const { client, db } = await connectToDb();
    const guitars = db.collection('Guitars');
    const result = await guitars.insertOne(newGuitar);

    client.close();
    res.json({ ...newGuitar, _id: result.insertedId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.put('/guitars/:id', upload.single('img'), async (req, res) => {
  try {
    const guitarId = req.params.id;
    const { name, description, cost, amount, type, brand, sellerLogin, userName, userPhone } = req.body;
    const img = req.file?.filename || req.body.img;

    console.log('PUT данные:', { guitarId, name, description, cost, amount, type, brand, sellerLogin, userName, userPhone, img }); // Для отладки

    const updatedGuitar = {
      img,
      name,
      description,
      cost: parseFloat(cost),
      amount: parseInt(amount, 10),
      type,
      brand,
      seller: {
        login: sellerLogin,
        name: userName,
        phone: userPhone
      }
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
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
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

module.exports = router;