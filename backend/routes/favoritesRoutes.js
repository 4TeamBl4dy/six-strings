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

// Удаляем дублирующий маршрут и оставляем только один для очистки избранного
router.patch('/favorites/delete', authenticateToken, async (req, res) => {
  const userId = req.userId;

  try {
    const { client, db } = await connectToDb();
    const users = db.collection('Users');
    const favoritesCopy = db.collection('Favorites');

    const result = await users.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { favorites: [] } }
    );

    await favoritesCopy.deleteMany({ user_id: userId });

    if (result.modifiedCount === 0) {
      client.close();
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    client.close();
    res.json({ message: 'Избранное пользователя успешно очищено' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;