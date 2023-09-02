const router = require('express').Router();

const { celebrate, Joi } = require('celebrate');

const { getMovies, createMovie, deleteMovie } = require('../controllers/movies');

const URLreg = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)[a-zA-Z0-9-]+\.[a-z]{2,6}(:[0-9]{1,5})?(\/.*)?$/;

router.get('/', getMovies);

router.post(
  '/',
  celebrate({
    body: Joi.object().keys({
      country: Joi.string().required().messages({
        'any.required': 'Необходимо заполнить это поле',
      }),
      director: Joi.string().required().messages({
        'any.required': 'Необходимо заполнить это поле',
      }),
      duration: Joi.number().required().messages({
        'any.required': 'Необходимо заполнить это поле',
      }),
      year: Joi.string().required().messages({
        'any.required': 'Необходимо заполнить это поле',
      }),
      description: Joi.string().required().messages({
        'any.required': 'Необходимо заполнить это поле',
      }),
      image: Joi.string().required().regex(URLreg).messages({
        'any.required': 'Необходимо заполнить это поле',
      }),
      trailerLink: Joi.string().required().regex(URLreg).messages({
        'any.required': 'Необходимо заполнить это поле',
      }),
      thumbnail: Joi.string().required().regex(URLreg).messages({
        'any.required': 'Необходимо заполнить это поле',
      }),
      movieId: Joi.string().required(),
      nameRU: Joi.string().required().messages({
        'any.required': 'Необходимо заполнить это поле',
      }),
      nameEN: Joi.string().required().messages({
        'any.required': 'Необходимо заполнить это поле',
      }),
    }),
  }),
  createMovie,
);

router.delete(
  '/:_id',
  celebrate({
    params: Joi.object().keys({
      movieId: Joi.string().required().length(24).hex(),
    }),
  }),
  deleteMovie,
);

module.exports = router;
