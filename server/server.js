const express = require('express');
const app = express();
const port = 3000;
const restRouter = require('./routes/rest');
const indexRouter = require('./routes/index');
const mongoose = require('mongoose');
const path = require('path');

mongoose.connect('mongodb://admin:admin01@ds139334.mlab.com:39334/coj', { useNewUrlParser: true });

app.use(express.static(path.join(__dirname, '../public')));
app.use('/', indexRouter);
app.use('/api/v1', restRouter);
 
app.listen(port, () => console.log(`example app listening on port ${port}!`));
