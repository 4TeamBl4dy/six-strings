const express = require('express');
const router = express.Router();
const { connectToDb, ObjectId } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

router.get('/favorites', authenticateToken, async (req, res) => {
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
    res.json(user.favorites || []);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/favorites', authenticateToken, async (req, res) => {
  const { guitarId, guitarImg, guitarName, guitarAmount, guitarCost } = req.body;
  const userId = req.userId;
  const date = new Date(); 

  try {
    const { client, db } = await connectToDb();
    const users = db.collection('Users');
    const favoritesCopy = db.collection('Favorites');
    await users.updateOne(
      { _id: new ObjectId(userId) },
      { $push: { favorites: { guitarId, guitarImg, guitarName, guitarAmount, guitarCost, date } } }
    );

    await favoritesCopy.insertOne({ user_id: userId, guitar_id: guitarId, date });

    client.close();
    res.json({ message: 'Товар успешно добавлен в избранное' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/favorites/delete', authenticateToken, async (req, res) => {
  const userId = req.userId;
  const { guitarId } = req.body;

  try {
    const { client, db } = await connectToDb();
    const users = db.collection('Users');

    await users.updateOne(
      { _id: new ObjectId(userId) },
      { $pull: { favorites: { guitarId } } }
    );

    client.close();
    res.json({ message: 'Товар удалён из избранного' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка при удалении из избранного' });
  }
});

// Удаление всех товаров из избранного
router.patch('/favorites/deleteAll', authenticateToken, async (req, res) => {
  const userId = req.userId;

  try {
    const { client, db } = await connectToDb();
    const users = db.collection('Users');
    const favoritesCopy = db.collection('Favorites');

    // Удаляем избранное из пользователя
    await users.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { favorites: [] } }
    );

    // Удаляем записи из копии избранного
    await favoritesCopy.deleteMany({ user_id: userId });

    client.close();
    res.json({ message: 'Все товары удалены из избранного' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка при удалении всех товаров из избранного' });
  }
});


module.exports = router;