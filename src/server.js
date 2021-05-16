const express = require('express');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const hpp = require('hpp');
const cors = require('cors');
const { port } = require('./config');
const errorHandler = require('./middleware/errorHandler');
const log = require('./logger');
const { corsOptions } = require('./config');

require('./db')();

const auth = require('./routes/auth');
const spot = require('./routes/spot');

const app = express();

app.use(compression());
app.use(express.json());
app.use(cookieParser());
app.use(mongoSanitize());
app.use(helmet());
app.use(hpp());
app.use(cors(corsOptions));
app.use('/api/v1/auth', auth);
app.use('/api/v1/spot', spot);
app.use(errorHandler);

app.listen(port, log.info(`Server running in ${port}`));

process.on('unhandledRejection', (err) => {
  log.error(err.message);
});

module.exports = app;
