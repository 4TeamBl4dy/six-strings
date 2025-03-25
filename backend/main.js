const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const multer = require("multer");

require('dotenv').config();

const app = express();

const port = 8080;
const dbUri = "mongodb+srv://Vlad:123@cluster.66iafdi.mongodb.net/";

app.use(cors());
app.use(express.json());

app.post('/login_user', async (req, res) => {
    const { email, password} = req.body;

    try {
      const client = await MongoClient.connect(dbUri);
      const db = client.db('GuitarKZ');
      const users = db.collection('Users');

      const user = await users.findOne({ email });  

      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const passwordMatch = user.password === password;

      if (!passwordMatch) {
          return res.status(402).json({ error: 'Invalid credentials' });
      }
      
      const token = jwt.sign({ _id: user._id, email: user.email, name: user.name, phone: user.phone, basket: user.basket, favorites: user.favorites }, "token");

      res.json({ token, name: user.name, phone: user.phone });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

app.listen(port, () => console.log(`Server running at http://localhost:${port}`));