const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { connectToDb } = require('../config/database');

router.post('/login_saler', async (req, res) => {
  const { email, password } = req.body;

  try {
    const { client, db } = await connectToDb();
    const salers = db.collection('Salers');

    const saler = await salers.findOne({ email });

    if (!saler) {
      client.close();
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const passwordMatch = saler.password === password;

    if (!passwordMatch) {
      client.close();
      return res.status(402).json({ error: 'Invalid credentials' });
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
      return res.status(401).json({ error: 'User already exists' });
    }

    const result = await salers.insertOne({ login, password, name, phone });

    const token = jwt.sign({ _id: result.insertedId, login, name, phone }, "access_token");

    client.close();
    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;