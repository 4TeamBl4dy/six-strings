const express = require('express');
const router = express.Router();
const { connectToDb, ObjectId } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

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
  const date = new Date();

  try {
    const { client, db } = await connectToDb();
    const users = db.collection('Users');
    const basketCopy = db.collection('Basket');

    await users.updateOne(
      { _id: new ObjectId(userId) },
      { $push: { basket: { guitarId, guitarImg, guitarName, guitarAmount, guitarCost, guitarCount, date } } }
    );

    await basketCopy.insertOne({
      user_id: userId,
      guitar_id: guitarId,
      date
    });

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

    await users.updateOne(
      { _id: new ObjectId(userId) },
      { $pull: { basket: { guitarId: guitarId } } }
    );

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

    const user = await users.findOne({ _id: new ObjectId(userId) });
    const basket = user.basket;

    for (const item of basket) {
      const guitarId = item.guitarId;
      const guitarCount = item.guitarCount;

      const guitar = await guitars.findOne({ _id: new ObjectId(guitarId) });
      const result = await guitars.updateOne(
        { _id: new ObjectId(guitarId) },
        { $inc: { amount: -guitarCount } }
      ).catch((error) => console.error(error));
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

router.post('/basket/confirm', authenticateToken, async (req, res) => {
  const userId = req.userId; 

  try {
    const { client, db } = await connectToDb();
    const users = db.collection('Users');
    const guitars = db.collection('Guitars');
    const basketCopy = db.collection('Basket');

    // Получаем корзину пользователя
    const user = await users.findOne({ _id: new ObjectId(userId) });
    const basket = user.basket || [];

    // Обновляем количество товаров
    for (const item of basket) {
      const guitarId = item.guitarId;
      const guitarCount = item.guitarCount;

      const guitar = await guitars.findOne({ _id: new ObjectId(guitarId) });
      if (!guitar) {
        client.close();
        return res.status(404).json({ error: `Товар с ID ${guitarId} не найден` });
      }

      const newAmount = guitar.amount - guitarCount;
      if (newAmount < 0) {
        client.close();
        return res.status(400).json({ error: `Недостаточно товара ${guitar.name} на складе` });
      }

      await guitars.updateOne(
        { _id: new ObjectId(guitarId) },
        { $set: { amount: newAmount } }
      );
    }

    await users.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { basket: [] } }
    );

    client.close();
    return res.json({ success: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false });
  }
});

router.post('/pay', authenticateToken, async (req, res) => {
  const { amount, paymentMethodId } = req.body;

  try {
    // Здесь должна быть логика Stripe для обработки платежа
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Stripe принимает сумму в копейках
      currency: 'kzt',
      payment_method: paymentMethodId,
      confirm: true,
      return_url: 'http://localhost:3000', // URL для возврата
    });

    // Пример сохранения платежа в базе данных
    const { client, db } = await connectToDb();
    const payments = db.collection('Payments');
    const paymentResult = await payments.insertOne({
      userId: req.userId,
      amount,
      transactionId: paymentIntent.id,
      status: paymentIntent.status,
      createdAt: new Date(),
    });

    client.close();

    res.json({
      success: paymentIntent.status === 'succeeded',
      transactionId: paymentIntent.id, // Возвращаем ID транзакции
    });
  } catch (error) {
    console.error('Ошибка при обработке платежа:', error);
    res.status(500).json({ success: false, error: 'Ошибка при обработке платежа' });
  }
});

module.exports = router;