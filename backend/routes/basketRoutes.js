const express = require('express');
const router = express.Router();
const { connectToDb, ObjectId } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

router.get('/basket', authenticateToken, async (req, res) => {
  const userId = req.userId;

  try {
    const { client, db } = await connectToDb();
    const users = db.collection('Users');
    const user = await users.findOne({ _id: new ObjectId(userId) });

    if (!user) {
      client.close();
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    client.close();
    res.json(user.basket || []);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/basket', authenticateToken, async (req, res) => {
  const { guitarId, guitarImg, guitarName, guitarAmount, guitarCost } = req.body;
  const guitarCount = 1;
  const userId = req.userId;

  try {
    const { client, db } = await connectToDb();
    const users = db.collection('Users');
    const basketCopy = db.collection('Basket');
    await users.updateOne(
      { _id: new ObjectId(userId) },
      { $push: { basket: { guitarId, guitarImg, guitarName, guitarAmount, guitarCost, guitarCount } } }
    );
    await basketCopy.insertOne({ user_id: userId, guitar_id: guitarId });

    client.close();
    res.json({ message: 'Товар успешно добавлен в корзину' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.put('/basket/:guitarId', authenticateToken, async (req, res) => {
  const guitarId = req.params.guitarId;
  const userId = req.userId;
  const action = req.body.action;

  try {
    const { client, db } = await connectToDb();
    const users = db.collection('Users');
    const user = await users.findOne({ _id: new ObjectId(userId) });
    const basket = user.basket;
    const guitar = basket.find((guitar) => guitar.guitarId === guitarId);

    if (!guitar) {
      client.close();
      return res.status(404).json({ error: 'Товар не найден в корзине' });
    }

    if (action === 'plus') {
      if (guitar.guitarCount < guitar.guitarAmount) {
        await users.updateOne(
          { _id: new ObjectId(userId), 'basket.guitarId': guitarId },
          { $inc: { 'basket.$.guitarCount': 1 } }
        );
        client.close();
        res.json({ message: 'Количество товара успешно увеличено' });
      } else {
        client.close();
        res.status(400).json({ error: 'Недостаточно товара на складе' });
      }
    } else if (action === 'minus') {
      if (guitar.guitarCount > 1) {
        await users.updateOne(
          { _id: new ObjectId(userId), 'basket.guitarId': guitarId },
          { $inc: { 'basket.$.guitarCount': -1 } }
        );
        client.close();
        res.json({ message: 'Количество товара успешно уменьшено' });
      } else {
        client.close();
        res.json({ message: 'Количество товара уже равно 1' });
      }
    } else {
      client.close();
      res.status(400).json({ error: 'Неверный запрос' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/basket/delete', authenticateToken, async (req, res) => {
  const userId = req.userId;
  const guitarId = req.body.guitarId;

  try {
    const { client, db } = await connectToDb();
    const users = db.collection('Users');
    const basketCopy = db.collection('Basket');

    await users.updateOne(
      { _id: new ObjectId(userId) },
      { $pull: { basket: { guitarId: guitarId } } }
    );

    await basketCopy.deleteOne({ user_id: userId, guitar_id: guitarId });

    client.close();
    res.json({ message: 'Товар успешно удален из корзины' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.patch('/basket/delete', authenticateToken, async (req, res) => {
  const userId = req.userId;

  try {
    const { client, db } = await connectToDb();
    const users = db.collection('Users');
    const guitars = db.collection('Guitars');
    const basketCopy = db.collection('Basket');

    const user = await users.findOne({ _id: new ObjectId(userId) });
    const basket = user.basket;

    await basketCopy.deleteMany({ user_id: userId });

    for (const item of basket) {
      const guitarId = item.guitarId;
      const guitarCount = item.guitarCount;

      const guitar = await guitars.findOne({ _id: new ObjectId(guitarId) });
      const result = await guitars.updateOne(
        { _id: new ObjectId(guitarId) },
        { $inc: { amount: -guitarCount } }
      ).catch((error) => console.error(error));

      if (result.modifiedCount !== 1) {
        console.log(`Modified count: ${result.modifiedCount}`);
      }
    }

    await users.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { basket: [] } }
    );

    client.close();
    res.json({ message: 'Корзина пользователя успешно очищена' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;