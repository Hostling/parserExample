const puppeteer = require('puppeteer'); // Подключаем пакет для работы с виртуальным браузером

class Scrapper {
  constructor() {
    this.browser = '';  // Выносим в конструктор текущий экземпляр браузера
    this.page = ''; // Выносим в конструктор текущую страницу
  }

  async startBrowser() {
    this.browser = await puppeteer.launch(); // Запускаем браузер
    this.page = await this.browser.newPage(); // Открываем новую вкладку
  }

  async getOthers(url) {
    try {
      await this.page.goto(`https://www.emag.ro/1/pd/${url}/`); // Открываем ссылку на товар
      await this.page.waitForSelector('a.js-load-more'); // Ждем пока загрузится страница
      await this.page.click('a.js-load-more'); // Нажимаем на кнопку "Загрузить еще"
      // Ждем, пока подгрузятся товары
      await this.page.waitForSelector('div.list-placeholder > div:nth-child(2) > form > div > div.table-cell-sm.va-middle.po-size-mdsc-sm.po-size-smsc-sm.po-size-xssc-full.po-pad-xl.po-text-small > p.product-new-price');
    } catch {
      return null;
    }
    // Обрабатываем страницу с товаром
    let result = await this.page.evaluate(() => {
      // Получаем URL товара
      let url = document.URL.split('/')[5];
      // Разделяем таблицу с товарами на ноды для работы с каждым из них
      let links = document.querySelectorAll('div.panel-body.pad-sep-sm');
      // Делаем их них массив
      let nodes = Array.from(links);
      // Извлекаем имя поставщика
      let customer = document.querySelector('div.table-cell-xs.va-middle.po-size-xssc-full > div > a > strong');
      customer === null ? customer = document.querySelector('a.js-mc-modal-trigger').innerText : customer = customer.innerText;
      // Извлекаем цену
      let mainPrice = document.querySelector('p.product-new-price').innerText;
      // Формируем строку таблицы для фронта
      let tempLinks = `<tr><td>${customer}</td><td>${url}</td><td>${mainPrice}</td></tr>`;
      // Обрабатываем каждую строку таблицы с товарами
      for(let i = 0; i < nodes.length; i++) {
        let node = nodes[i];
        // Извлекаем имя товара
        let name = node.querySelector('div.po-text-small.inline-block');
        // Извлекаем цену
        let price = node.querySelector('p.product-new-price');
        // Формируем строку таблицы для фронта
        name === null || price === null ? null : tempLinks += `<tr><td>${name.innerText}</td><td>${url}</td><td>${price.innerText}</td></tr>`;
      }
      return tempLinks; // Результатом выполнения функции обработки страницы возвращаем подготовленные строки таблицы
    });

    return result; // Результатом выполнения метода getOthers возвращаем результат обработки страницы
  }
}

module.exports = Scrapper;
