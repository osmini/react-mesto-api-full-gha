// 648476afc6258b5f9eee415e тестовый пользователь
const express = require('express'); // импортируем библиотеку express
const bodyParser = require('body-parser'); // импортируем парсер json
const routes = require('./routes/index'); // импортируем модуль всех роутеров приложения
const mongoose = require('mongoose'); //подключаем mongoose
const hendlerErrors = require('./middlewares/errors'); // импортируем модуль обработки ошибок
const { errors } = require('celebrate'); // обработка ошибок от библиотеки celebrate (Валидация приходящих на сервер данных)
const { requestLogger, errorLogger } = require('./middlewares/logger'); // импорт логеров
const cors = require('cors') // подключаем бибилиотреку с работай ошибки cors
const cookieParser = require('cookie-parser'); // библиотека для работы с куками

// переменные окружения
const {
  PORT = 4000,
  MONGO_URL = 'mongodb://127.0.0.1:27017'
} = process.env;

// подключение к БД
mongoose.connect(`${MONGO_URL}/mestodb`, {
  useNewUrlParser: true,
})
.then(() => {
  console.log('connected to db');
});

const app = express(); // создаем приложение

// важно писать запуск middleware в определенной очередности запросов
// подключаем обработку запросов с других портов и доменов
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}))

app.use(cookieParser()); // подключаем обработку куки

app.use(bodyParser.json()); // подключаем обработку json всех запросах к серверу

app.use(requestLogger); // подключаем логгер запросов (важно подключить до огбработки роутов запросов)

// обработка запроса по адресу "/" методом get
app.get('/', (req, res) => {
  res.status(200);
  res.send('hello world2');
});

app.use(routes); // подключаем обработку всех роутеров
app.use(errorLogger); // подключаем логгер ошибок (Важно подключить до обработки ошибок)
app.use(errors()); // // обработка ошибок celebrate
app.use(hendlerErrors); // подключаем обработку ошибок после выполнения роутов

// запускаем сервер на порту 3000, с этого порта слушаем все входящие запросы
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});