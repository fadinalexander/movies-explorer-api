const jwt = require('jsonwebtoken');

const UnauthorizedError = require('../errors/UnauthorizedError');

const { NODE_ENV, JWT_SECRET } = process.env;

module.exports = (req, res, next) => {
  const token = req.cookies.userId;

  if (!token) {
    next(new UnauthorizedError('Вы не авторизованы'));
    return;
  }

  let payload;

  try {
    payload = jwt.verify(token, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret');
  } catch (error) {
    next(new UnauthorizedError('Вы не авторизованы'));
    return;
  }
  req.user = payload;
  next();
};
