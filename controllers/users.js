const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const BadRequestError = require('../errors/BadRequestError');
const NotFoundError = require('../errors/NotFoundError');
const ConflictError = require('../errors/ConflictError');
const InternalServerError = require('../errors/InternalServerError');
// const UnauthorizedError = require('../errors/UnauthorizedError');

const { NODE_ENV, JWT_SECRET } = process.env;

const createUser = (req, res, next) => {
  const {
    name, email, password,
  } = req.body;
  bcrypt
    .hash(password, 10)
    .then((hash) => User.create({
      name,
      email,
      password: hash,
    }))
    .then((user) => {
      const userResponseData = user.toObject();
      delete userResponseData.password;
      res.status(201).send(userResponseData);
    })
    .catch((error) => {
      if (error.name === 'ValidationError') {
        return next(new BadRequestError('Некорректные данные - запрос не может быть обработан'));
      }
      if (error.code === 11000) {
        return next(new ConflictError('Пользователь с такими данными уже существует'));
      }
      return next(error);
    });
};

const login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUserByCredentials({ email, password })
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret', { expiresIn: '7d' });
      res.cookie('userId', token, {
        maxAge: 604800000,
        httpOnly: true,
        sameSite: true,
      });
      res.send(user);
    })
    .catch((error) => {
      next(error);
    });
};

const logout = (req, res) => {
  res.clearCookie('userId').send({ message: 'Вы успешно вышли из профиля' });
};

const getUserInfo = (req, res, next) => User.findById(req.user._id)
  .orFail(new NotFoundError('Пользователь не найден'))
  .then((user) => {
    res.status(200).send(user);
  })
  .catch((error) => {
    next(error);
  });

const updateUserInfo = (req, res, next) => {
  const { name, email } = req.body;
  const { _id } = req.user;
  User.findByIdAndUpdate({ _id }, { name, email }, { new: true, runValidators: true })
    .orFail(new NotFoundError('Пользователь не найден'))
    .then((user) => {
      res.status(200).send(user);
    })
    .catch((error) => {
      if (error.name === 'ValidationError') {
        next(new BadRequestError('Некорректные данные - запрос не может быть обработан'));
      } else {
        next(new InternalServerError('На сервере произошла ошибка'));
      }
    });
};

module.exports = {
  createUser,
  login,
  logout,
  getUserInfo,
  updateUserInfo,
};
