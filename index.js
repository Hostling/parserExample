const Scrapper = require('./Scrapper'); // Подключаем класс с логикой парсинга
const scrapper = new Scrapper(); // Инициализируем экземпляр класса с логикой парсинга
const fs = require('fs'); // Подключаем пакет для работы с файловой системой
const express = require('express'); // Подключаем пакет для работы с веб-сервером
const app = express(); // Инициализируем веб-сервер
const http = require('http').createServer(app); // Создаем экземпляр веб-сервера
const io = require('socket.io')(http); // Подключаем пакет socket.io для подгрузки результатов на страницу

// Запускаем прослушивание 4433 порта для веб-сервера
http.listen(4433, () => {
    console.log('Listening 4433 port...');
});

app.use(express.static('dist')); // Для отрисовки страницы используем содержимое директории dist

// При загрузке странице в браузере используем следующую логику:
io.on('connection', socket => {
   socket.on('load', async () => {
       await scrapper.startBrowser(); // Запускаем экземпляр браузера
       const links = JSON.parse(fs.readFileSync('allLinks.log', 'utf8')); // Читаем файл с товарами

       // Для каждого товара в списке делаем следующее:
       for(let i = 0; i < links.length; i++) {
           const url = links[i];
           // Передаем на фронт идентификатор товара
           await socket.emit('newLink', url);
           // Обрабатываем товар
           let info = await scrapper.getOthers(url);
           // Передаем на фронт результат обработки товара
           await socket.emit('newLine', info);
       }
       // Закрываем браузер, чтобы избежать утечки памяти
       await scrapper.browser.close();
   });
});




