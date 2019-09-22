const express = require('express');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors')

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.static(path.resolve('./sites')));

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: [' --no-sandbox' ]
  });

  app.all('/', async (req, res) => {
    const html = req.body['html'];
    const options = JSON.parse(req.body['options']);

    let headerTemplate = fs.readFileSync(path.resolve(path.join("./sites", options["header-html"]))).toString();
    let footerTemplate =  fs.readFileSync(path.resolve(path.join("./sites", options["footer-html"]))).toString();
    let pageHtml = `${headerTemplate} ${html}`

    const page = await browser.newPage();
    await page.setContent(pageHtml, { waitUntil: 'domcontentloaded' });
    await page.addStyleTag({ url: 'http://localhost:3000/assets/css/printview.css' });
    await page.waitFor(1000);

    const pdf = await page.pdf({
        format: 'A4',
        scale: 0.9,
        displayHeaderFooter: true,
        headerTemplate: '<div></div>',
        footerTemplate,
        margin: {
          right: options['margin-right'],
          left: options['margin-left'],
          top: options['margin-top'],
          bottom: '25mm' || options['margin-bottom'],
        }
      });

      res.send({ pdf });
  })

  app.all('/withBrowser', async (req, res) => {
    try {
      const html = req.body.html || req.body['html'];
      const options = JSON.parse(JSON.parse(req.body.options)) || JSON.parse(JSON.parse(req.body['options']));

      let headerTemplate = fs.readFileSync(path.resolve(path.join("./sites", options["header-html"]))).toString();
      let footerTemplate =  fs.readFileSync(path.resolve(path.join("./sites", options["footer-html"]))).toString();
      let pageHtml = `${headerTemplate} ${html}`

      const page = await browser.newPage();
      await page.setContent(pageHtml, { waitUntil: 'domcontentloaded' });
      await page.addStyleTag({ url: 'http://localhost:3000/assets/css/printview.css' });
      await page.waitFor(1000);

      const pdf = await page.pdf({
        format: 'A4',
        scale: '0.9',
        displayHeaderFooter: true,
        headerTemplate: '<div></div',
        footerTemplate,
        margin: {
          right: options['margin-right'],
          left: options['margin-left'],
          top: options['margin-top'],
          bottom: options['margin-bottom'],
        }
      });

      res.send({ pdf });
    } catch (error) {
      console.log(error)
      res.send({});
    }
  })

  

  app.listen(port, () => console.log(`Puppeteer service listening on port ${port}!`))
})();
