const User = require('../models/users'); // подключаем модель пользователей
const bcrypt = require('bcrypt'); // подключаем библиотеку для шифрования
const jwt = require('jsonwebtoken'); // подключаем библиотеку для токенов
const BadRequestError = require('../errors/badRequestError'); // подключаем класс ошибок 400
const ForbiddenError = require('../errors/forbiddenError'); // подключаем класс ошибок 403
const NotFoundErrors = require('../errors/notFoundErrors'); // подключаем класс ошибок 404
const ConflictError = require('../errors/conflictError'); // подключаем класс ошибок 409


const SALT_ROUNDS = 10; // константа для соли шифрования
const JWT_SECRET = 'super-strong-secret'; // константа для шифрования jwt токина

// регистрация нового пользователя
// next используется для централизованной обработки ошибок
// next не прерывает выполнение кода, поэтому код описанный ниже все равно выполнится, нужно выходить из метода при помощи return после выполнения блока next
const createUser = (req, res, next) => {
  const {email, password, name, about, avatar} = req.body;

  if (!email || !password){
    throw new BadRequestError('Не переданны email или пароль');
  };

  // ищем пользователя по email на случай того что такой пользователь уже есть в бд
  return User.findOne({email:email})
    .then((newUser) => {
      if (newUser){
        next (new ConflictError('Такой пользователь уже существует'));
        return;
      }

      // если пользователя нет в базе, то создаем нового пользователя и
      // шифруем пароль пользователя
      bcrypt.hash(password, SALT_ROUNDS, function(err, hash){

        return User.create({email, password: hash, name, about, avatar})
          .then((newUser) => {
            return res.status(201).send({
              email: newUser.email,
              name: newUser.name,
              about: newUser.about,
              avatar: newUser.avatar
            });
          })
          .catch((err) =>{
            if (err.name === 'ValidationError'){
              next (new BadRequestError('Переданы некорректные данные пользователя'));
              return;
              // В случае непредвиденной ошибки ответ повиснет, если условие if не сработало, то нужно направлять ошибку в блок next, чтобы вернулся код ответа 500:
            } else {
              next(err);
            };
          })
      });
    });
};

// авторизация пользователя
const login = (req, res, next) => {
  const {email, password} = req.body;

  if (!email || !password){
    throw new BadRequestError('Не переданны email или пароль');
  };

  // ищем пользователя по email и дастаем хеш пароля из БД
  return User.findOne({email:email}).select('+password')
    .then((user) => {
      if (!user){
        next (new ForbiddenError('Такого пользователя не существует'));
        return;
      }
      bcrypt.compare(password, user.password, function(err, passwordMatch){   // проводим проверку пароля предварительно его расшифровав
        if (!passwordMatch){
          next (new ForbiddenError('Неправельный пароль'));
          return;
        }
        // создаем и отдаем токен
        const token = jwt.sign({_id: user._id}, JWT_SECRET, {expiresIn: '7d'});
        // Api и front находятся на разных доменах
        res.cookie('jwt', token, {
          maxAge: 604800,
          httpOnly: true,
          sameSite: true,
          secure: true,
        })
        return res.status(200).send({ message: 'Успешный вход в систему' });
      });
    })
    .catch((err) => {
      next(err);
    });
};

// получить всех пользователей
const getUsers = (req, res, next) => {

  return User.find({})
    .then((users) => {
      if(!users){
        next (new NotFoundErrors('Пользователи не найдены'));
        return;
      };
      return res.status(200).send(users);
    })
    .catch((err) => {
        next(err);
    });
};

// получить одного пользователя по id
const getUsersById = (req, res, next) => {
  const {userId} = req.params;

  return User.findById(userId)
  .orFail(new Error('NotValidId'))
  .then((user) => {
    return res.status(200).send(user);
  })
  .catch((err) =>{
    if(err.message === 'NotValidId'){
      next (new NotFoundErrors('Пользователь не найден'));
      return;
    }
    else if(err.name === 'ValidationError'){
      next (new BadRequestError('Передан некорректный id пользователя'));
      return;
    } else {
      next(err);
    }
  })
};

// получить информацию о себе
const getInfoMe = (req, res, next) => {
  const userId = req.user._id;

  return User.findById(userId)
  .orFail(new Error('NotValidId'))
  .then((user) => {
    return res.status(200).send(user);
  })
  .catch((err) =>{
    if(err.message === 'NotValidId'){
      next (new NotFoundErrors('Пользователь не найден'));
      return;
    } else {
      next(err);
    };
    if(err.name === 'ValidationError'){
      next (new BadRequestError('Передан некорректный id пользователя'));
      return;
    } else {
      next(err);
    };
  })
};

// обновить данные о пользователе
const updatetUsers = (req, res, next) => {
  const {name, about} = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    {name, about},
    { new: true, runValidators: true })
    .then((user) => {
      return res.status(200).send(user);
    })
    .catch((err) =>{
      if(err.message === 'NotValidId'){
        next (new NotFoundErrors('Пользователь не найден'));
        return;
      } else {
        next(err);
      };
    })
};

// обновить аватар
const updatetAvatar = (req, res, next) => {
  const avatar = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    avatar,
    { new: true, runValidators: true })
    .then((user) => {
      return res.status(200).send(user);
    })
    .catch((err) =>{
      if(err.message === 'NotValidId'){
        next (new NotFoundErrors('Пользователь не найден'));
        return;
      } else {
        next(err);
      };
    })
};

module.exports = {
  createUser,
  login,
  getUsers,
  getUsersById,
  getInfoMe,
  updatetUsers,
  updatetAvatar
}