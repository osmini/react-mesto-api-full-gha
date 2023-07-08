const jwt = require('jsonwebtoken');
const UnauthorizedError = require('../errors/unauthorizedError'); // подключаем класс ошибок 401

module.exports = (req, res, next) => {
  // достаём токен из куки
  const token = req.cookies.jwt;

  // убеждаемся, что он есть
  if (!token ) {
    throw new UnauthorizedError('Необходима авторизация');
  }

  let payload;

  try {
    // попытаемся верифицировать токен
    payload = jwt.verify(token, 'super-strong-secret');
  } catch (err) {
    // отправим ошибку, если не получилось
    throw new UnauthorizedError('Необходима авторизация');
  }

  req.user = payload; // записываем пейлоуд в объект запроса

  next(); // пропускаем запрос дальше
};