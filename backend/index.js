const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Импорт маршрутов
const userRoutes = require('./routes/userRoutes');
const salerRoutes = require('./routes/salerRoutes');
const basketRoutes = require('./routes/basketRoutes');
const favoritesRoutes = require('./routes/favoritesRoutes');
const guitarsRoutes = require('./routes/guitarsRoutes');

const app = express();
const port = 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Подключение маршрутов
app.use(userRoutes);
app.use(salerRoutes);
app.use(basketRoutes);
app.use(favoritesRoutes);
app.use(guitarsRoutes);

app.listen(port, () => console.log(`Server running at http://localhost:${port}`));