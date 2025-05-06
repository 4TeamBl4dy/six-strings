const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { connectToDb } = require('../config/database');

router.post('/login_user', async (req, res) => {
  const { login, password } = req.body;

  try {
    const { client, db } = await connectToDb();
    const users = db.collection('Users');

    const user = await users.findOne({ login });

    if (!user) {
      client.close();
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const passwordMatch = user.password === password;

    if (!passwordMatch) {
      client.close();
      return res.status(402).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      {
        _id: user._id,
        login: user.login,
        name: user.name,
        phone: user.phone,
        basket: user.basket,
        favorites: user.favorites,
      },
      'token'
    );

    client.close();
    res.json({ token, name: user.name, phone: user.phone });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/register_user', async (req, res) => {
  const { login, password, name, phone } = req.body;

  try {
    const { client, db } = await connectToDb();
    const users = db.collection('Users');

    const existingUser = await users.findOne({ login });

    if (existingUser) {
      client.close();
      return res.status(401).json({ error: 'User already exists' });
    }

    const result = await users.insertOne({ login, password, name, phone, basket: [], favorites: [] });

    const token = jwt.sign({ _id: result.insertedId, login, name, phone, basket: [], favorites: [] }, "access_token");

    client.close();
    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;