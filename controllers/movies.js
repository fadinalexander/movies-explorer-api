const Movie = require('../models/movie');

const BadRequestError = require('../errors/BadRequestError');
const NotFoundError = require('../errors/NotFoundError');
const ForbiddenError = require('../errors/ForbiddenError');

const getMovies = (req, res, next) => {
  Movie.find({ owner: req.user._id })
    .then((movies) => {
      res.status(200).send(movies);
    })
    .catch(() => {
      next();
    });
};

const createMovie = (req, res, next) => {
  const { _id } = req.user;
  Movie.create({ ...req.body, owner: _id })
    .then((createdMovie) => {
      res.status(201).send(createdMovie);
    })
    .catch((error) => {
      if (error.name === 'ValidationError') {
        return next(new BadRequestError('Данные переданы не верно'));
      }
      return next(error);
    });
};

const deleteMovie = (req, res, next) => {
  const { movieId } = req.params;
  const { _id } = req.user;
  Movie.findById(movieId)
    .then((movie) => {
      if (!movie) {
        throw new NotFoundError('Фильм не найден');
      } else if (movie.owner.toString() !== _id) {
        throw new ForbiddenError('Нельзя удалить фильм другого пользователя');
      }
      return Movie.findByIdAndRemove(movieId);
    })
    .then((removedMovie) => {
      res.status(200).send(removedMovie);
    })
    .catch((error) => {
      if (error instanceof NotFoundError || error instanceof ForbiddenError) {
        return next(error);
      } if (error.name === 'CastError') {
        return next(new BadRequestError('Данные переданы не верно'));
      }
      return next(error);
    });
};

module.exports = {
  getMovies,
  createMovie,
  deleteMovie,
};
