const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Импорт маршрутов
const userRoutes = require('./routes/userRoutes');
const salerRoutes = require('./routes/salerRoutes');
const basketRoutes = require('./routes/basketRoutes');
const favoritesRoutes = require('./routes/favoritesRoutes');
const guitarsRoutes = require('./routes/guitarsRoutes');
const statsRoutes = require('./routes/statsRoutes');

const app = express();
const port = 3941;

const whitelist = ['http://localhost:3940'];
const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || whitelist.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: ['Content-Type', 'Authorization', 'X-HTTP-Method-Override'],
    credentials: true,
    optionsSuccessStatus: 204,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Подключение маршрутов
app.use(userRoutes);
app.use(salerRoutes);
app.use(basketRoutes);
app.use(favoritesRoutes);
app.use(guitarsRoutes);
app.use(statsRoutes);

app.listen(port, () => console.log(`Server running at http://localhost:${port}`));
