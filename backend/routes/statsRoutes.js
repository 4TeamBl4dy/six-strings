const express = require('express');
const router = express.Router();
const { connectToDb, ObjectId } = require('../config/database');

router.get('/stats', async (req, res) => {
  const sellerLogin = req.query.sellerLogin;

  if (!sellerLogin) {
    return res.status(400).json({ error: 'sellerLogin is required' });
  }

  let client;
  try {
    const { client: dbClient, db } = await connectToDb();
    client = dbClient; // Сохраняем клиент для закрытия
    const guitars = db.collection('Guitars');
    const basket = db.collection('Basket');
    const favorites = db.collection('Favorites');
    const users = db.collection('Users');
    const payments = db.collection('Payments');

    // Получаем гитары продавца
    const sellerGuitars = await guitars.find({ 'seller.login': sellerLogin }).toArray();
    const guitarIds = sellerGuitars.map(g => g._id.toString());

    // Создаем маппинг гитар для быстрого доступа к имени
    const guitarMap = {};
    sellerGuitars.forEach(g => {
      guitarMap[g._id.toString()] = g.name;
    });

    // Статистика корзины
    const basketStats = await basket
      .aggregate([
        { $match: { guitar_id: { $in: guitarIds } } },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
              guitar_id: '$guitar_id',
            },
            count: { $sum: 1 },
          },
        },
        {
          $group: {
            _id: '$_id.date',
            total: { $sum: '$count' },
          },
        },
        { $sort: { _id: 1 } },
      ])
      .toArray();

    // Статистика избранного
    const favoritesStats = await favorites
      .aggregate([
        { $match: { guitar_id: { $in: guitarIds } } },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
              guitar_id: '$guitar_id',
            },
            count: { $sum: 1 },
          },
        },
        {
          $group: {
            _id: '$_id.date',
            total: { $sum: '$count' },
          },
        },
        { $sort: { _id: 1 } },
      ])
      .toArray();

    // Загружаем детали из Basket и Favorites
    const rawBasket = await basket.find({ guitar_id: { $in: guitarIds } }).toArray();
    const rawFavorites = await favorites.find({ guitar_id: { $in: guitarIds } }).toArray();

    // Собираем уникальные user_id
    const userIds = [
      ...new Set([
        ...rawBasket.map(entry => entry.user_id),
        ...rawFavorites.map(entry => entry.user_id),
      ]),
    ].filter(Boolean);

    // Получаем логины пользователей
    const userDocs = await users
      .find({
        _id: { $in: userIds.map(id => new ObjectId(id)) },
      })
      .toArray();

    const userMap = {};
    userDocs.forEach(user => {
      userMap[user._id.toString()] = user.login || '';
    });

    // Детали корзины (без асинхронных findOne)
    const basketDetails = rawBasket.map(entry => ({
      date: new Date(entry.date).toISOString().split('T')[0],
      productId: entry.guitar_id,
      productName: guitarMap[entry.guitar_id] || '',
      userId: entry.user_id || '',
      userLogin: userMap[entry.user_id] || '',
    }));

    // Детали избранного (без асинхронных findOne)
    const favoritesDetails = rawFavorites.map(entry => ({
      date: new Date(entry.date).toISOString().split('T')[0],
      productId: entry.guitar_id,
      productName: guitarMap[entry.guitar_id] || '',
      userId: entry.user_id || '',
      userLogin: userMap[entry.user_id] || '',
    }));

    // Получаем данные о платежах для продавца
    const paymentDetails = await payments
      .find({
        userId: { $in: userIds },
        status: 'succeeded',
      })
      .toArray();

    res.json({
      basket: basketStats,
      favorites: favoritesStats,
      basketDetails,
      favoritesDetails,
      paymentDetails,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    if (client) {
      await client.close(); // Закрываем соединение после всех операций
    }
  }
});

router.get('/pay', async (req, res) => {
  const sellerLogin = req.query.sellerLogin;

  if (!sellerLogin) {
    return res.status(400).json({ error: 'sellerLogin is required' });
  }

  let client;
  try {
    const { client: dbClient, db } = await connectToDb();
    client = dbClient;
    const users = db.collection('Users');
    const payments = db.collection('Payments');

    const sellerUser = await users.findOne({ login: sellerLogin });
    if (!sellerUser) {
      return res.status(404).json({ error: 'Seller not found' });
    }

    const userIds = await db
      .collection('Basket')
      .distinct('user_id', {
        guitar_id: {
          $in: (await db.collection('Guitars').find({ 'seller.login': sellerLogin }).toArray()).map(g => g._id.toString()),
        },
      });
    const paymentDetails = await payments
      .find({
        userId: { $in: userIds },
        status: 'succeeded',
      })
      .toArray();

    res.json({ paymentDetails });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    if (client) {
      await client.close();
    }
  }
});

module.exports = router;