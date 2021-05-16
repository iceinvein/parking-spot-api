const mongoose = require('mongoose');
const { mongodbUrl } = require('../config');
const log = require('../logger');

const connectDB = async () => {
  await mongoose.connect(mongodbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  });

  log.info('Database Connected');
};

module.exports = connectDB;
