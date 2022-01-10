const express = require('express');
const app = express();
const port = process.env.PORT || 5000;

const controller = require('./controllers/mainController');

app.get('/', controller.urlCacheController, controller.rootController);
app.get('/:id', controller.urlCacheController, controller.codeController);
app.get('/:id/*', controller.urlCacheController, controller.moveController);

app.listen(port,     () => {
  console.log(`App running at port : ${port}`);
});
