const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Токен отсутствует' });
  }

  jwt.verify(token, 'token', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Невалидный токен' });
    }
    req.userId = user._id;
    next();
  });
};

module.exports = { authenticateToken };